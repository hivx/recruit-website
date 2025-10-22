const express = require("express");

const router = express.Router();
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");
const requireJobApproved = require("../middleware/requireJobApproved");
const authorizeRoles = require("../middleware/roleMiddleware");
const uploadCV = require("../utils/uploadCV");

// @route   POST /api/applications
// @desc    Ứng tuyển công việc (chỉ dành cho applicant)
router.post(
  "/",
  authMiddleware,
  authorizeRoles("applicant", "admin"),
  uploadCV.single("cv"), // parse multipart để có req.body
  requireJobApproved, // bây giờ đọc được jobId rồi
  applicationController.createApplication,
);

// @route   GET /api/applications/:jobId
// GET: Lấy danh sách ứng viên đã ứng tuyển vào công việc
router.get(
  "/job/:jobId",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  applicationController.getApplicantsByJob,
);

module.exports = router;
