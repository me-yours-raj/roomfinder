const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/register", authLimiter, authController.register);
router.post("/verify-registration-otp", authLimiter, authController.verifyRegistrationOtp);
router.post("/resend-registration-otp", authLimiter, authController.resendRegistrationOtp);
router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);
router.get("/me", optionalAuth, authController.me);
router.post("/select-role", requireAuth, authController.selectRole);
router.put("/profile", requireAuth, authController.updateProfile);

module.exports = router;
