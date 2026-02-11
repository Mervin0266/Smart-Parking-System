"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all logs (with pagination)
router.get("/", async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    try {
        const [logs, total] = await Promise.all([
            prisma.parking_log.findMany({
                skip,
                take: Number(limit),
                orderBy: { entry_time: "desc" },
                include: {
                    vehicle: true,
                    parking_slot: true,
                },
            }),
            prisma.parking_log.count(),
        ]);
        res.json({ logs, total, page: Number(page), limit: Number(limit) });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch parking logs" });
    }
});
// Get today's logs
router.get("/today", async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
        const logs = await prisma.parking_log.findMany({
            where: {
                entry_time: { gte: today },
            },
            orderBy: { entry_time: "desc" },
            include: {
                vehicle: true,
                parking_slot: true,
            },
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch today's logs" });
    }
});
// Get active parkings (entry but no exit)
router.get("/active", async (req, res) => {
    try {
        const logs = await prisma.parking_log.findMany({
            where: { exit_time: null },
            orderBy: { entry_time: "desc" },
            include: {
                vehicle: true,
                parking_slot: true,
            },
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch active parkings" });
    }
});
// Vehicle entry
router.post("/entry", async (req, res) => {
    const { vehicle_id, slot_id, notes } = req.body;
    try {
        // Get vehicle with assignment and payment
        const vehicle = await prisma.vehicle.findUnique({
            where: { vehicle_id: parseInt(vehicle_id) },
            include: {
                slot_assignment: { include: { parking_slot: true } },
                parking_payment: true,
            },
        });
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }
        // Check if vehicle is already parked
        const activeParking = await prisma.parking_log.findFirst({
            where: {
                vehicle_id: parseInt(vehicle_id),
                exit_time: null,
            },
        });
        if (activeParking) {
            return res.status(400).json({ error: "Vehicle is already parked" });
        }
        // Validate based on owner type
        if (vehicle.owner_type !== "visitor") {
            // Student/Faculty: must have active payment
            if (!vehicle.parking_payment ||
                vehicle.parking_payment.status !== "active") {
                return res.status(400).json({ error: "No active parking payment" });
            }
            // Must use assigned slot
            if (!vehicle.slot_assignment) {
                return res
                    .status(400)
                    .json({ error: "No slot assigned to this vehicle" });
            }
            if (vehicle.slot_assignment.slot_id !== parseInt(slot_id)) {
                return res
                    .status(400)
                    .json({ error: "Vehicle must park in assigned slot" });
            }
        }
        // Check slot availability
        const slot = await prisma.parking_slot.findUnique({
            where: { slot_id: parseInt(slot_id) },
        });
        if (!slot) {
            return res.status(404).json({ error: "Slot not found" });
        }
        if (slot.is_occupied) {
            return res.status(400).json({ error: "Slot is already occupied" });
        }
        // Validate slot type
        if (vehicle.owner_type === "visitor" && slot.slot_type !== "VISITOR") {
            return res
                .status(400)
                .json({ error: "Visitors can only use VISITOR slots" });
        }
        if (vehicle.owner_type !== "visitor" && slot.slot_type !== "PAID") {
            return res
                .status(400)
                .json({ error: "Students/Faculty must use PAID slots" });
        }
        // Create log and update slot
        const [log] = await prisma.$transaction([
            prisma.parking_log.create({
                data: {
                    vehicle_id: parseInt(vehicle_id),
                    slot_id: parseInt(slot_id),
                    notes,
                },
                include: { vehicle: true, parking_slot: true },
            }),
            prisma.parking_slot.update({
                where: { slot_id: parseInt(slot_id) },
                data: { is_occupied: true },
            }),
        ]);
        res.json({ message: "Vehicle entry recorded", log });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to record entry" });
    }
});
// Vehicle exit
router.patch("/exit/:logId", async (req, res) => {
    try {
        const log = await prisma.parking_log.findUnique({
            where: { log_id: parseInt(req.params.logId) },
        });
        if (!log) {
            return res.status(404).json({ error: "Parking log not found" });
        }
        if (log.exit_time) {
            return res.status(400).json({ error: "Vehicle has already exited" });
        }
        // Update log and slot
        const [updatedLog] = await prisma.$transaction([
            prisma.parking_log.update({
                where: { log_id: parseInt(req.params.logId) },
                data: { exit_time: new Date() },
                include: { vehicle: true, parking_slot: true },
            }),
            prisma.parking_slot.update({
                where: { slot_id: log.slot_id },
                data: { is_occupied: false },
            }),
        ]);
        res.json({ message: "Vehicle exit recorded", log: updatedLog });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to record exit" });
    }
});
// Exit by vehicle plate
router.patch("/exit/plate/:numberPlate", async (req, res) => {
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { number_plate: req.params.numberPlate.toUpperCase() },
        });
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }
        const activeLog = await prisma.parking_log.findFirst({
            where: {
                vehicle_id: vehicle.vehicle_id,
                exit_time: null,
            },
        });
        if (!activeLog) {
            return res.status(400).json({ error: "Vehicle is not currently parked" });
        }
        const [updatedLog] = await prisma.$transaction([
            prisma.parking_log.update({
                where: { log_id: activeLog.log_id },
                data: { exit_time: new Date() },
                include: { vehicle: true, parking_slot: true },
            }),
            prisma.parking_slot.update({
                where: { slot_id: activeLog.slot_id },
                data: { is_occupied: false },
            }),
        ]);
        res.json({ message: "Vehicle exit recorded", log: updatedLog });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to record exit" });
    }
});
exports.default = router;
