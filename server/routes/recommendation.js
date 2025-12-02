const express = require("express");
const recommendationController = require("../controllers/recommendationController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Sinh job đề xuất cho user (ứng viên)
router.get(
  "/:userId",
  authMiddleware,
  recommendationController.getRecommendedJobs,
);

// Sinh candidate đề xuất cho recruiter
router.get(
  "/recruiter/:userId",
  authMiddleware,
  recommendationController.getRecommendedCandidates,
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

module.exports = router;
