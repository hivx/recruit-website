const express = require("express");
const recommendationController = require("../controllers/recommendationController");
const recommendSystemController = require("../controllers/recommendSystemController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Sinh candidate đề xuất cho recruiter
router.get(
  "/recruiter/:recruiterId",
  authMiddleware,
  recommendationController.getRecommendedCandidates,
);

// Lấy job đề xuất cho user (ứng viên)
router.get(
  "/:userId",
  authMiddleware,
  recommendationController.getRecommendedJobs,
);

// POST recommendations for a user
router.post(
  "/:userId",
  authMiddleware,
  authorizeRoles("applicant", "admin"),
  recommendationController.jobRecommendations,
);

// Recommend candidate cho recruiter
router.post(
  "/recruiter/:userId",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  recommendationController.recommendCandidates,
);

// Send job recommendations
router.post(
  "/jobs/send",
  authMiddleware,
  authorizeRoles("admin"),
  recommendSystemController.sendJobRecommendations,
);

// Send candidate recommendations
router.post(
  "/candidates/send",
  authMiddleware,
  authorizeRoles("admin"),
  recommendSystemController.sendCandidateRecommendations,
);

module.exports = router;
