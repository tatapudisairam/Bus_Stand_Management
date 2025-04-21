const Employee = require("../Models/EmployeeModel");
const { createSecretToken } = require("../util/SecretToken");
const { insertEmployeeProfile } = require("../Controllers/AdminSqlController");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


module.exports.Signup = async (req, res) => {
    try {
        const { email, password, username, job_type, bus_stand } = req.body;

        const existingEmployeeByEmail = await Employee.findOne({ email });
        if (existingEmployeeByEmail) {
            return res.status(409).json({ message: "Employee already exists with this email" });
        }

        const existingEmployeeByUsername = await Employee.findOne({ username });
        if (existingEmployeeByUsername) {
            return res.status(409).json({ message: "Username already exists. Use another one." });
        }

        const employee = await Employee.create({ email, password, username });

        const token = createSecretToken(employee._id);

        insertEmployeeProfile({ username, job_type, email, bus_stand }, (err, employeeId) => {
            if (err) {
                return res.status(500).json({ message: "Error inserting employee profile", success: false });
            }

            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                to: email,
                from: process.env.EMAIL_USER,
                subject: "Account Created Successfully!",
                text: `Hello ${username},\n\nYour account has been successfully created for the bus stand "${bus_stand}". Your job type is: "${job_type}".\n\nBest regards,\nYour Company Team`,
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error('Error sending email:', err);
                    return res.status(500).json({ message: "Error sending email", success: false });
                }

                res.cookie("token", token, {
                    withCredentials: true,
                    httpOnly: false,
                });

                res.status(201).json({
                    message: "Employee signed up successfully",
                    success: true,
                    employeeId: employeeId,
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};



module.exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(401).json({ message: "Email is not registered." });
        }

        const auth = await bcrypt.compare(password, employee.password);
        if (!auth) {
            return res.status(401).json({ message: "Incorrect email or password" });
        }

        const token = createSecretToken(employee._id);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
        });

        res.status(200).json({
            message: "Employee logged in successfully",
            success: true,
            employeeId: employee._id,
            employeeUsername: employee.username,
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

module.exports.ForgotPassword = async (req, res) => {
    const { email } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) {
        return res.status(404).json({ message: "No employee found with this email" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    employee.resetToken = token;
    employee.resetTokenExpiration = Date.now() + 600000; // 10 minutes
    await employee.save();

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        to: email,
        from: process.env.EMAIL_USER,
        subject: "Password Reset",
        text: `You requested a password reset. Click the following link to reset your password: http://localhost:3000/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error sending email", success: false });
        }
        res.status(200).json({ message: "Password reset link sent to your email", success: true });
    });
};

module.exports.ResetPassword = async (req, res) => {
    const { token, password } = req.body;
    const employee = await Employee.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if (!employee) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    employee.password = password;
    employee.resetToken = undefined;
    employee.resetTokenExpiration = undefined;
    await employee.save();

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        to: employee.email,
        from: process.env.EMAIL_USER,
        subject: "Password Successfully Reset",
        text: `Hello ${employee.username},\n\nYour password has been successfully reset. If you did not request this change, please contact support immediately.\n\nBest regards,\nBus Stand Team`
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error('Error sending reset confirmation email:', err);
            return res.status(500).json({ message: "Password reset successful, but failed to send confirmation email", success: true });
        }

        res.status(200).json({ message: "Password has been reset successfully. A confirmation email has been sent.", success: true, employeeId: employee._id });
    });

};
