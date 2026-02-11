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

// Get faculty by faculty_id
router.get("/:facultyId", async (req, res) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { faculty_id: parseInt(req.params.facultyId) },
    });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Faculty not found" });
  }
});

// Add new faculty
router.post("/", async (req, res) => {
  const { faculty_id, name, email, phone, department, license_number } =
    req.body;

  try {
    const faculty = await prisma.faculty.create({
      data: {
        faculty_id: parseInt(faculty_id),
        name,
        email,
        phone,
        department,
        license_number,
      },
    });
    res.json({ message: "Faculty added successfully", faculty });
  } catch (error) {
    res.status(500).json({ error: "Failed to add faculty" });
  }
});

// Update faculty
router.put("/:facultyId", async (req, res) => {
  const { name, email, phone, department, license_number } = req.body;

  try {
    const faculty = await prisma.faculty.update({
      where: { faculty_id: parseInt(req.params.facultyId) },
      data: {
        name,
        email,
        phone,
        department,
        license_number,
      },
    });
    res.json({ message: "Faculty updated successfully", faculty });
  } catch (error) {
    res.status(500).json({ error: "Failed to update faculty" });
  }
});

// Delete faculty
router.delete("/:facultyId", async (req, res) => {
  try {
    await prisma.faculty.delete({
      where: { faculty_id: parseInt(req.params.facultyId) },
    });
    res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete faculty" });
  }
});

export default router;
