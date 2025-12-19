import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all assignments
router.get("/", async (req, res) => {
  try {
    const assignments = await prisma.slot_assignment.findMany({
      include: {
        vehicle: true,
        parking_slot: true,
      },
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch slot assignments" });
  }
});

// Assign slot to vehicle
router.post("/", async (req, res) => {
  const { vehicle_id, slot_id } = req.body;

  try {
    // Check if vehicle already has an assignment
    const existingAssignment = await prisma.slot_assignment.findUnique({
      where: { vehicle_id: parseInt(vehicle_id) },
    });

    if (existingAssignment) {
      return res
        .status(400)
        .json({ error: "Vehicle already has an assigned slot" });
    }

    // Check if slot is available
    const slot = await prisma.parking_slot.findUnique({
      where: { slot_id: parseInt(slot_id) },
    });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    // Verify vehicle payment status for PAID slots
    const vehicle = await prisma.vehicle.findUnique({
      where: { vehicle_id: parseInt(vehicle_id) },
      include: { parking_payment: true },
    });

    if (slot.slot_type === "PAID" && vehicle?.owner_type !== "visitor") {
      if (
        !vehicle?.parking_payment ||
        vehicle.parking_payment.status !== "active"
      ) {
        return res
          .status(400)
          .json({ error: "Active payment required for PAID slot" });
      }
    }

    if (slot.slot_type === "VISITOR" && vehicle?.owner_type !== "visitor") {
      return res
        .status(400)
        .json({ error: "VISITOR slots are only for visitors" });
    }

    const assignment = await prisma.slot_assignment.create({
      data: {
        vehicle_id: parseInt(vehicle_id),
        slot_id: parseInt(slot_id),
      },
      include: {
        vehicle: true,
        parking_slot: true,
      },
    });

    res.json({ message: "Slot assigned successfully", assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to assign slot" });
  }
});

// Remove assignment
router.delete("/:id", async (req, res) => {
  try {
    await prisma.slot_assignment.delete({
      where: { assignment_id: parseInt(req.params.id) },
    });
    res.json({ message: "Slot assignment removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove slot assignment" });
  }
});

// Remove assignment by vehicle
router.delete("/vehicle/:vehicleId", async (req, res) => {
  try {
    await prisma.slot_assignment.delete({
      where: { vehicle_id: parseInt(req.params.vehicleId) },
    });
    res.json({ message: "Slot assignment removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove slot assignment" });
  }
});

export default router;
