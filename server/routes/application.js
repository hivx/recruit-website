const express = require("express");

const router = express.Router();
const applicationController = require("../controllers/applicationController");
const auth = require("../middleware/authMiddleware");
const requireJobApproved = require("../middleware/requireJobApproved");
const authorizeRoles = require("../middleware/roleMiddleware");
const uploadCV = require("../utils/uploadCV");

// @route   POST /api/applications
// @desc    Ứng tuyển công việc (chỉ dành cho applicant)
router.post(
  "/",
  auth,
  requireJobApproved,
  authorizeRoles("applicant", "admin"), // chỉ applicant hoặc admin
  uploadCV.single("cv"), // middleware Multer xử lý tệp tải lên
  applicationController.createApplication,
);

// @route   GET /api/applications/:jobId
// GET: Lấy danh sách ứng viên đã ứng tuyển vào công việc
router.get(
  "/job/:jobId",
  auth,
  authorizeRoles("recruiter", "admin"),
  applicationController.getApplicantsByJob,
);

module.exports = router;
