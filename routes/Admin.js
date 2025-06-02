import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

const router = express.Router();

// Middleware to ensure admin exists
router.use(async (req, res, next) => {
    try {
        await Admin.initializeDefault();
        next();
    } catch (err) {
        res.status(500).json({ message: "Error initializing admin", error: err.message });
    }
});

// POST /admin/login
router.post("/login", async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: "Password is required" });

        const admin = await Admin.findOne();
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password" });

        // Optional: Generate JWT here
        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// PUT /admin/change-password
router.put("/change-password", async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword)
            return res.status(400).json({ message: "Both current and new passwords are required" });

        const admin = await Admin.findOne();
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

        admin.password = newPassword; // triggers `pre('save')` to hash
        await admin.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;
