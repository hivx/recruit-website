// server/routes/company.js
const express = require("express");

const router = express.Router();

const companyController = require("../controllers/companyController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const uploadAvatar = require("../utils/uploadAvatar");

// recruiter
router.post(
  "/",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  uploadAvatar.single("logo"), // nếu FE gửi avatar
  companyController.createCompany,
);
router.get(
  "/me",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  companyController.getMyCompany,
);
router.patch(
  "/me",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  uploadAvatar.single("logo"), // nếu FE gửi avatar
  companyController.updateMyCompany,
);
router.post(
  "/me/submit",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  companyController.submitForReview,
);

// admin
router.patch(
  "/admin/:id/verify",
  authMiddleware,
  authorizeRoles("admin"),
  companyController.verifyCompany,
);

module.exports = router;
