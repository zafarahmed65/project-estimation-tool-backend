import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminPasswordSchema = new mongoose.Schema(
    {
        password: { type: String, required: true },
    },
    { timestamps: true }
);


// Middleware to hash password before saving
AdminPasswordSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


// Create default admin only once
AdminPasswordSchema.statics.initializeDefault = async function () {
    const existing = await this.findOne();
    if (!existing) {
        await this.create({ password: "admin" }); // will be hashed automatically
    }
};

const Admin = mongoose.model("Admin", AdminPasswordSchema);
export default Admin;
