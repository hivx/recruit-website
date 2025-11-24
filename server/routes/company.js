// routes/company.js
const express = require("express");

const router = express.Router();

const companyController = require("../controllers/companyController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// recruiter
router.post(
  "/",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
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
