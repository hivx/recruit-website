const express = require("express");
const recommendationController = require("../controllers/recommendationController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

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
