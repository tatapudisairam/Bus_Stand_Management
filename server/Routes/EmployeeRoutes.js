const { Signup, Login, ForgotPassword, ResetPassword } = require("../Controllers/EmployeeAuthController");
const { employeeVerification } = require("../Middlewares/EmployeeAuthMiddleware");
const router = require("express").Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);
router.post("/verify", employeeVerification);

module.exports = router;
