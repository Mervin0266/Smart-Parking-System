import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Add new student
router.post("/", async (req, res) => {
  const {
    Register_Number,
    Name,
    Email,
    Phone_Number,
    Department,
    License_Number,
  } = req.body;

  try {
    console.log("Received student data:", req.body); // Debug log

    const student = await prisma.student.create({
      data: {
        register_number: parseInt(Register_Number),
        name: Name,
        email: Email,
        phone: Phone_Number,
        department: Department,
        license_number: License_Number,
      },
    });
    res.json({ message: "Student added successfully", student });
  } catch (error) {
    console.error("Error adding student:", error); // Log the actual error
    res.status(500).json({
      error: "Failed to add student",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Update student
router.put("/:registerNumber", async (req, res) => {
  const { Name, Email, Phone_Number, Department, License_Number } = req.body;

  try {
    const student = await prisma.student.update({
      where: { register_number: parseInt(req.params.registerNumber) },
      data: {
        name: Name,
        email: Email,
        phone: Phone_Number,
        department: Department,
        license_number: License_Number,
      },
    });
    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    res.status(500).json({ error: "Failed to update student" });
  }
});

// Delete student
router.delete("/:registerNumber", async (req, res) => {
  try {
    await prisma.student.delete({
      where: { register_number: parseInt(req.params.registerNumber) },
    });
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

export default router;
