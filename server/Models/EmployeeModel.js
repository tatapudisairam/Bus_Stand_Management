const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
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

employeeSchema.pre("save", async function () {
    this.realPassword = this.password;
});

employeeSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
