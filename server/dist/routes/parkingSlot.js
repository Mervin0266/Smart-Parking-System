"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all parking slots
router.get("/", async (req, res) => {
    try {
        const slots = await prisma.parking_slot.findMany({
            include: {
                slot_assignment: {
                    include: { vehicle: true },
                },
            },
        });
        res.json(slots);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch parking slots" });
    }
});
// Get available slots by type
router.get("/available/:type", async (req, res) => {
    try {
        const slots = await prisma.parking_slot.findMany({
            where: {
                slot_type: req.params.type.toUpperCase(),
                is_occupied: false,
            },
        });
        res.json(slots);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch available slots" });
    }
});
// Get slot statistics
router.get("/stats", async (req, res) => {
    try {
        const [total, occupied, paidSlots, visitorSlots] = await Promise.all([
            prisma.parking_slot.count(),
            prisma.parking_slot.count({ where: { is_occupied: true } }),
            prisma.parking_slot.count({ where: { slot_type: "PAID" } }),
            prisma.parking_slot.count({ where: { slot_type: "VISITOR" } }),
        ]);
        res.json({
            total,
            occupied,
            available: total - occupied,
            paidSlots,
            visitorSlots,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch slot statistics" });
    }
});
// Create parking slot
router.post("/", async (req, res) => {
    const { slot_name, slot_type } = req.body;
    try {
        const slot = await prisma.parking_slot.create({
            data: {
                slot_name,
                slot_type: slot_type.toUpperCase(),
                is_occupied: false,
            },
        });
        res.json({ message: "Parking slot created successfully", slot });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create parking slot" });
    }
});
// Bulk create parking slots
router.post("/bulk", async (req, res) => {
    const { prefix, slot_type, count, startNumber } = req.body;
    try {
        const slots = [];
        for (let i = 0; i < count; i++) {
            slots.push({
                slot_name: `${prefix}${startNumber + i}`,
                slot_type: slot_type.toUpperCase(),
                is_occupied: false,
            });
        }
        await prisma.parking_slot.createMany({ data: slots });
        res.json({ message: `${count} parking slots created successfully` });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create parking slots" });
    }
});
// Update slot occupancy
router.patch("/:id/occupancy", async (req, res) => {
    const { is_occupied } = req.body;
    try {
        const slot = await prisma.parking_slot.update({
            where: { slot_id: parseInt(req.params.id) },
            data: { is_occupied },
        });
        res.json({ message: "Slot occupancy updated", slot });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update slot occupancy" });
    }
});
// Delete parking slot
router.delete("/:id", async (req, res) => {
    try {
        await prisma.parking_slot.delete({
            where: { slot_id: parseInt(req.params.id) },
        });
        res.json({ message: "Parking slot deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete parking slot" });
    }
});
exports.default = router;
