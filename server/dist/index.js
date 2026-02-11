"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
// Import all routes
const auth_1 = __importDefault(require("./routes/auth"));
const student_1 = __importDefault(require("./routes/student"));
const faculty_1 = __importDefault(require("./routes/faculty"));
const visitor_1 = __importDefault(require("./routes/visitor"));
const vehicle_1 = __importDefault(require("./routes/vehicle"));
const parkingSlot_1 = __importDefault(require("./routes/parkingSlot"));
const slotAssignment_1 = __importDefault(require("./routes/slotAssignment"));
const parkingPayment_1 = __importDefault(require("./routes/parkingPayment"));
const parkingLog_1 = __importDefault(require("./routes/parkingLog"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/auth", auth_1.default);
app.use("/api/students", student_1.default);
app.use("/api/faculty", faculty_1.default);
app.use("/api/visitors", visitor_1.default);
app.use("/api/vehicles", vehicle_1.default);
app.use("/api/slots", parkingSlot_1.default);
app.use("/api/assignments", slotAssignment_1.default);
app.use("/api/payments", parkingPayment_1.default);
app.use("/api/logs", parkingLog_1.default);
// Test route
app.get("/", (req, res) => {
    res.json({ message: "Parking System API" });
});
// Health check
app.get("/health", async (req, res) => {
    try {
        await prisma.$connect();
        res.json({ status: "ok", database: "connected" });
    }
    catch (error) {
        res.status(500).json({ status: "error", database: "disconnected" });
    }
});
// Dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
    try {
        const [totalSlots, occupiedSlots, totalVehicles, activePayments, todayEntries, activeParking,] = await Promise.all([
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
    }
    catch (error) {
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
