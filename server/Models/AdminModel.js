const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    bus_stand_id: {
        type: Number,
        required: [true, "Password is required"],
    },
    realPassword: {
        type: String,
    },
    resetToken: {
        type: String,
    },
    resetTokenExpiration: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

adminSchema.pre("save", async function () {
    this.realPassword = this.password;
});

adminSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
