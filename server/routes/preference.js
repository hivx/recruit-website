// server/routes/preference.js
const express = require("express");

const router = express.Router();
const preferenceController = require("../controllers/preferenceController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// GET và UPSERT career preference của chính mình
router.get(
  "/career-preference",
  authMiddleware,
  authorizeRoles("applicant", "admin"), // chỉ applicant hoặc admin
  preferenceController.getCareerPreference,
);
// PUT để tạo hoặc cập nhật career preference
router.put(
  "/career-preference",
  authMiddleware,
  authorizeRoles("applicant", "admin"), // chỉ applicant hoặc admin
  preferenceController.upsertCareerPreference,
);

// GET và UPSERT recruiter preference của chính mình
router.get(
  "/recruiter",
  authMiddleware,
  authorizeRoles("recruiter", "admin"), // chỉ recruiter hoặc admin
  preferenceController.getMyRecruiterPref,
);

// PUT để tạo hoặc cập nhật recruiter preference
router.put(
  "/recruiter",
  authMiddleware,
  authorizeRoles("recruiter", "admin"), // chỉ recruiter hoặc admin
  preferenceController.upsertMyRecruiterPref,
);

module.exports = router;
