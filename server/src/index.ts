import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Import all routes
import authRoutes from "./routes/auth";
import studentRoutes from "./routes/student";
import facultyRoutes from "./routes/faculty";
import visitorRoutes from "./routes/visitor";
import vehicleRoutes from "./routes/vehicle";
import parkingSlotRoutes from "./routes/parkingSlot";
import slotAssignmentRoutes from "./routes/slotAssignment";
import parkingPaymentRoutes from "./routes/parkingPayment";
import parkingLogRoutes from "./routes/parkingLog";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/slots", parkingSlotRoutes);
app.use("/api/assignments", slotAssignmentRoutes);
app.use("/api/payments", parkingPaymentRoutes);
app.use("/api/logs", parkingLogRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Parking System API" });
});

// Health check
app.get("/health", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// Dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [
      totalSlots,
      occupiedSlots,
      totalVehicles,
      activePayments,
      todayEntries,
      activeParking,
    ] = await Promise.all([
      prisma.parking_slot.count(),
      prisma.parking_slot.count({ where: { is_occupied: true } }),
      prisma.vehicle.count(),
      prisma.parking_payment.count({ where: { status: "active" } }),
      prisma.parking_log.count({
        where: {
          entry_time: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.parking_log.count({ where: { exit_time: null } }),
    ]);

    res.json({
      totalSlots,
      occupiedSlots,
      availableSlots: totalSlots - occupiedSlots,
      totalVehicles,
      activePayments,
      todayEntries,
      activeParking,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
