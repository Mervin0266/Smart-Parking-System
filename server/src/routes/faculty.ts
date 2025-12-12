import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all faculty
router.get("/", async (req, res) => {
  try {
    const faculty = await prisma.faculty.findMany();
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
});

// Get faculty by register number
router.get("/:registerNumber", async (req, res) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { Register_Number: parseInt(req.params.registerNumber) },
    });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Faculty not found" });
  }
});

// Add new faculty
router.post("/", async (req, res) => {
  const {
    Register_Number,
    Name,
    Email,
    Phone_Number,
    Department,
    License_Number,
    Category_,
  } = req.body;

  try {
    const faculty = await prisma.faculty.create({
      data: {
        Register_Number: parseInt(Register_Number),
        Name,
        Email,
        Phone_Number,
        Department,
        License_Number,
        Category_,
      },
    });
    res.json({ message: "Faculty added successfully", faculty });
  } catch (error) {
    res.status(500).json({ error: "Failed to add faculty" });
  }
});

// Update faculty
router.put("/:registerNumber", async (req, res) => {
  const { Name, Email, Phone_Number, Department, License_Number, Category_ } =
    req.body;

  try {
    const faculty = await prisma.faculty.update({
      where: { Register_Number: parseInt(req.params.registerNumber) },
      data: {
        Name,
        Email,
        Phone_Number,
        Department,
        License_Number,
        Category_,
      },
    });
    res.json({ message: "Faculty updated successfully", faculty });
  } catch (error) {
    res.status(500).json({ error: "Failed to update faculty" });
  }
});

// Delete faculty
router.delete("/:registerNumber", async (req, res) => {
  try {
    await prisma.faculty.delete({
      where: { Register_Number: parseInt(req.params.registerNumber) },
    });
    res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete faculty" });
  }
});

export default router;
