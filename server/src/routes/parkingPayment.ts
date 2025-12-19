import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all payments
router.get("/", async (req, res) => {
  try {
    const payments = await prisma.parking_payment.findMany({
      include: { vehicle: true },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Get payment by vehicle
router.get("/vehicle/:vehicleId", async (req, res) => {
  try {
    const payment = await prisma.parking_payment.findUnique({
      where: { vehicle_id: parseInt(req.params.vehicleId) },
      include: { vehicle: true },
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: "Payment not found" });
  }
});

// Create payment
router.post("/", async (req, res) => {
  const { vehicle_id, amount, start_date, end_date } = req.body;

  try {
    // Check if vehicle exists and is not a visitor
    const vehicle = await prisma.vehicle.findUnique({
      where: { vehicle_id: parseInt(vehicle_id) },
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    if (vehicle.owner_type === "visitor") {
      return res
        .status(400)
        .json({ error: "Visitors don't require parking payment" });
    }

    const payment = await prisma.parking_payment.create({
      data: {
        vehicle_id: parseInt(vehicle_id),
        amount: amount ? parseFloat(amount) : null,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: "active",
      },
    });

    res.json({ message: "Payment created successfully", payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// Update payment status
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!["active", "expired", "disabled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const payment = await prisma.parking_payment.update({
      where: { payment_id: parseInt(req.params.id) },
      data: { status },
    });
    res.json({ message: "Payment status updated", payment });
  } catch (error) {
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

// Extend payment
router.patch("/:id/extend", async (req, res) => {
  const { end_date } = req.body;

  try {
    const payment = await prisma.parking_payment.update({
      where: { payment_id: parseInt(req.params.id) },
      data: {
        end_date: new Date(end_date),
        status: "active",
      },
    });
    res.json({ message: "Payment extended", payment });
  } catch (error) {
    res.status(500).json({ error: "Failed to extend payment" });
  }
});

// Delete payment
router.delete("/:id", async (req, res) => {
  try {
    await prisma.parking_payment.delete({
      where: { payment_id: parseInt(req.params.id) },
    });
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete payment" });
  }
});

export default router;
