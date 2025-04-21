const { Signup, Login, ForgotPassword, ResetPassword } = require("../Controllers/AdminAuthController");
const { adminVerification } = require("../Middlewares/AdminAuthMiddleware");
const router = require("express").Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);
router.post("/verify", adminVerification);
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router; 
