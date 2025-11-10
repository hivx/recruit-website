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

// @route   GET /api/applications/me
// GET: Lấy danh sách ứng dụng của chính mình (applicant)
router.get("/me", authMiddleware, applicationController.getMyApplications);

// @route   PATCH /api/applications/:id/review
// PATCH: Đánh giá (review) hồ sơ ứng viên (recruiter/admin)
router.patch(
  "/:id/review",
  authMiddleware,
  applicationController.reviewApplication,
);

// @route   PUT /api/applications/:id
// PUT: Cập nhật hồ sơ ứng tuyển (applicant/admin)
router.put(
  "/:id",
  authMiddleware,
  uploadCV.single("cv"), // xử lý file CV nếu có
  applicationController.updateApplication,
);

module.exports = router;
