import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all visitors
router.get("/", async (req, res) => {
  try {
    const visitors = await prisma.visitor.findMany();
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
});

// Add new visitor
router.post("/", async (req, res) => {
  const { name, phone, purpose, vehicle_number, id_proof } = req.body;

  try {
    const visitor = await prisma.visitor.create({
      data: { name, phone, purpose, vehicle_number, id_proof },
    });
    res.json({ message: "Visitor added successfully", visitor });
  } catch (error) {
    res.status(500).json({ error: "Failed to add visitor" });
  }
});

// Delete visitor by vehicle_number (unique field)
router.delete("/:vehicleNumber", async (req, res) => {
  try {
    await prisma.visitor.delete({
      where: {
        vehicle_number: req.params.vehicleNumber,
      },
    });
    res.json({ message: "Visitor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete visitor" });
  }
});

export default router;
