import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all vehicles with owner details
router.get("/", async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        parking_payment: true,
        slot_assignment: {
          include: { parking_slot: true },
        },
      },
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

// Get vehicle by ID
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { vehicle_id: parseInt(req.params.id) },
      include: {
        parking_payment: true,
        slot_assignment: { include: { parking_slot: true } },
        parking_log: { orderBy: { entry_time: "desc" }, take: 10 },
      },
    });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Vehicle not found" });
  }
});

// Get vehicle by number plate
router.get("/plate/:numberPlate", async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { number_plate: req.params.numberPlate.toUpperCase() },
      include: {
        parking_payment: true,
        slot_assignment: { include: { parking_slot: true } },
        parking_log: { orderBy: { entry_time: "desc" }, take: 5 },
      },
    });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Vehicle not found" });
  }
});

// Create new vehicle
router.post("/", async (req, res) => {
  const { number_plate, vehicle_type, owner_type, owner_id, owner_details } =
    req.body;

  try {
    let finalOwnerId = owner_id;

    // Create owner record based on owner_type
    if (owner_details) {
      if (owner_type === "student") {
        // Check if student already exists
        const existingStudent = await prisma.student.findUnique({
          where: { register_number: parseInt(owner_details.register_number) },
        });

        if (!existingStudent) {
          const student = await prisma.student.create({
            data: {
              register_number: parseInt(owner_details.register_number),
              name: owner_details.name,
              email: owner_details.email,
              phone: owner_details.phone,
              department: owner_details.department,
              license_number: owner_details.license_number,
            },
          });
          finalOwnerId = student.register_number;
        } else {
          finalOwnerId = existingStudent.register_number;
        }
      } else if (owner_type === "faculty") {
        // Check if faculty already exists
        const existingFaculty = await prisma.faculty.findUnique({
          where: { faculty_id: parseInt(owner_details.faculty_id) },
        });

        if (!existingFaculty) {
          const faculty = await prisma.faculty.create({
            data: {
              faculty_id: parseInt(owner_details.faculty_id),
              name: owner_details.name,
              email: owner_details.email,
              phone: owner_details.phone,
              department: owner_details.department,
              license_number: owner_details.license_number,
            },
          });
          finalOwnerId = faculty.faculty_id;
        } else {
          finalOwnerId = existingFaculty.faculty_id;
        }
      } else if (owner_type === "visitor") {
        // Check if visitor already exists
        const existingVisitor = await prisma.visitor.findUnique({
          where: { vehicle_number: number_plate.toUpperCase() },
        });

        if (!existingVisitor) {
          await prisma.visitor.create({
            data: {
              vehicle_number: number_plate.toUpperCase(),
              name: owner_details.name,
              phone: owner_details.phone,
              purpose: owner_details.purpose,
              id_proof: owner_details.id_proof,
            },
          });
        }
        finalOwnerId = null; // Visitors don't have owner_id
      }
    }

    // Create vehicle record
    const vehicle = await prisma.vehicle.create({
      data: {
        number_plate: number_plate.toUpperCase(),
        vehicle_type,
        owner_type,
        owner_id: finalOwnerId,
      },
      include: {
        parking_payment: true,
        slot_assignment: { include: { parking_slot: true } },
      },
    });

    res.json({ message: "Vehicle created successfully", vehicle });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res
      .status(500)
      .json({ error: "Failed to create vehicle", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Update vehicle
router.put("/:id", async (req, res) => {
  const { number_plate, vehicle_type, owner_type, owner_id } = req.body;

  try {
    const vehicle = await prisma.vehicle.update({
      where: { vehicle_id: parseInt(req.params.id) },
      data: {
        number_plate: number_plate?.toUpperCase(),
        vehicle_type,
        owner_type,
        owner_id: owner_id ? parseInt(owner_id) : null,
      },
    });
    res.json({ message: "Vehicle updated successfully", vehicle });
  } catch (error) {
    res.status(500).json({ error: "Failed to update vehicle" });
  }
});

// Delete vehicle
router.delete("/:id", async (req, res) => {
  try {
    await prisma.vehicle.delete({
      where: { vehicle_id: parseInt(req.params.id) },
    });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete vehicle" });
  }
});

export default router;
