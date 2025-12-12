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
  const { Name, Phone_Number, Email, Purpose } = req.body;

  try {
    const visitor = await prisma.visitor.create({
      data: { Name, Phone_Number, Email, Purpose },
    });
    res.json({ message: "Visitor added successfully", visitor });
  } catch (error) {
    res.status(500).json({ error: "Failed to add visitor" });
  }
});

// Delete visitor
router.delete("/:phoneNumber/:name", async (req, res) => {
  try {
    await prisma.visitor.delete({
      where: {
        Phone_Number_Name: {
          Phone_Number: req.params.phoneNumber,
          Name: req.params.name,
        },
      },
    });
    res.json({ message: "Visitor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete visitor" });
  }
});

export default router;
