const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const validateGmail = require("../middleware/validateGmail");

router.post("/register", validateGmail, authController.register);

router.post("/login", authController.login);

router.get("/me", authMiddleware, authController.getMe);

router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password", authController.resetPassword);

// Xác minh email
router.get("/verify-email", authController.verifyEmail);

module.exports = router;
