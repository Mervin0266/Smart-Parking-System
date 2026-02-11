"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: { username },
        });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        res.json({
            message: "Login successful",
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});
// Register new user (admin only)
router.post("/register", async (req, res) => {
    const { username, password, role, license_number } = req.body;
    if (!["admin", "security"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.users.create({
            data: {
                username,
                password_hash: hashedPassword,
                role,
                license_number,
            },
        });
        res.json({
            message: "User created successfully",
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create user" });
    }
});
// Get all users (admin only)
router.get("/users", async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            select: {
                user_id: true,
                username: true,
                role: true,
                license_number: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
exports.default = router;
