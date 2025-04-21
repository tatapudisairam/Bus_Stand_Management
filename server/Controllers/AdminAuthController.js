const Admin = require("../Models/AdminModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sqlConnection = require("../Config/sql_db")
const { insertAdminProfile } = require("../Controllers/AdminSqlController")


module.exports.Signup = async (req, res) => {
    try {
        const { email, password, username, bus_stand_id } = req.body;

        const existingAdminByEmail = await Admin.findOne({ email });
        if (existingAdminByEmail) {
            return res.status(409).json({ message: "Admin already exists with this email" });
        }

        const existingAdminByUsername = await Admin.findOne({ username });
        if (existingAdminByUsername) {
            return res.status(409).json({ message: "Username already exists. Use another one." });
        }

        const getBusStandNameQuery = 'SELECT bus_stand_name FROM bus_stand WHERE bus_stand_id = ?';

        sqlConnection.query(getBusStandNameQuery, [bus_stand_id], async (err, results) => {
            if (err) {
                console.error('Error fetching bus stand name:', err);
                return res.status(500).json({ message: 'Error fetching bus stand name from database' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Bus stand not found" });
            }

            const bus_stand_name = results[0].bus_stand_name;

            const checkAdminQuery = 'SELECT id FROM admin_profiles WHERE bus_stand_name = ?';

            sqlConnection.query(checkAdminQuery, [bus_stand_name], async (err, results) => {
                if (err) {
                    console.error('Error checking admin for bus stand:', err);
                    return res.status(500).json({ message: 'Database error while checking bus stand incharge' });
                }

                if (results.length > 0) {
                    return res.status(400).json({ message: "This bus stand already has an incharge." });
                }

                const admin = await Admin.create({ email, password, username, bus_stand_id });

                insertAdminProfile({ username, bus_stand_name, email }, (err, results) => {
                    if (err) {
                        console.error('Error inserting admin profile into SQL:', err);
                        return res.status(500).json({ message: 'Error saving admin profile to SQL database' });
                    }

                    const token = createSecretToken(admin._id);

                    res.cookie("token", token, {
                        withCredentials: true,
                        httpOnly: false,
                    });

                    // Send email after successful account creation
                    const transporter = nodemailer.createTransport({
                        service: 'gmail', // Use your mail service, e.g., Gmail
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS,
                        }
                    });

                    const mailOptions = {
                        from: process.env.EMAIL_USER, // Your email address
                        to: email, // Admin email
                        subject: 'Account Created - Bus Stand Incharge',
                        text: `Hello ${username},\n\nYour account has been successfully created. You are now the incharge of the bus stand: ${bus_stand_name}.\n\nThank you!\n\nBest regards,\nBus Stand Admin Team`
                    };

                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            console.error('Error sending email:', err);
                            return res.status(500).json({ message: 'Failed to send confirmation email' });
                        }

                        console.log('Email sent: ' + info.response);
                    });

                    res.status(201).json({
                        message: "Admin signed up successfully",
                        success: true,
                        adminId: admin._id
                    });
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

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: "Email is not registered." });
        }

        const auth = await bcrypt.compare(password, admin.password);
        if (!auth) {
            return res.status(401).json({ message: "Incorrect email or password" });
        }

        const token = createSecretToken(admin._id);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
        });

        res.status(200).json({
            message: "Admin logged in successfully",
            success: true,
            adminId: admin._id,
            adminUsername: admin.username,
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

module.exports.ForgotPassword = async (req, res) => {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
        return res.status(404).json({ message: "No admin found with this email" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    admin.resetToken = token;
    admin.resetTokenExpiration = Date.now() + 600000; // 10 minutes
    await admin.save();

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
        text: `You requested a password reset. Click the following link to reset your password: http://localhost:3001/reset-password/${token}`,
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
    const admin = await Admin.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if (!admin) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    admin.password = password;
    admin.resetToken = undefined;
    admin.resetTokenExpiration = undefined;
    await admin.save();

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        to: admin.email,
        from: process.env.EMAIL_USER,
        subject: "Password Successfully Reset",
        text: `Hello ${admin.username},\n\nYour password has been successfully reset. If you did not request this change, please contact support immediately.\n\nBest regards,\nBus Stand Admin Team`
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error('Error sending reset confirmation email:', err);
            return res.status(500).json({ message: "Password reset successful, but failed to send confirmation email", success: true });
        }

        res.status(200).json({ message: "Password has been reset successfully. A confirmation email has been sent.", success: true, adminId: admin._id });
    });
};
