// routes/company.js
const express = require("express");

const router = express.Router();

const companyController = require("../controllers/companyController");
const auth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// recruiter
router.post(
  "/",
  auth,
  authorizeRoles("recruiter", "admin"),
  companyController.createCompany,
);
router.get(
  "/me",
  auth,
  authorizeRoles("recruiter", "admin"),
  companyController.getMyCompany,
);
router.patch(
  "/me",
  auth,
  authorizeRoles("recruiter", "admin"),
  companyController.updateMyCompany,
);
router.post(
  "/me/submit",
  auth,
  authorizeRoles("recruiter", "admin"),
  companyController.submitForReview,
);

// admin
router.patch(
  "/admin/:id/verify",
  auth,
  authorizeRoles("admin"),
  companyController.verifyCompany,
);

module.exports = router;
