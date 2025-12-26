// server/routes/job.js
const express = require("express");

const router = express.Router();
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");
const authOptional = require("../middleware/authOptional");
const requireRecruiterWithVerifiedCompany = require("../middleware/requireRecruiterWithVerifiedCompany");
const authorizeRoles = require("../middleware/roleMiddleware");
// GET: Lấy cập nhật cơ bản của chính mình
router.get(
  "/my-jobs",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  jobController.getMyJobs,
);
// POST: Chỉ recruiter được đăng tin
router.post(
  "/",
  authMiddleware,
  requireRecruiterWithVerifiedCompany,
  authorizeRoles("recruiter", "admin"), // chỉ recruiter hoặc admin
  jobController.createJob,
);

// GET all: public
router.get("/", authOptional, jobController.getAllJobs);

// GET popular tags: public
router.get("/popular-tags", jobController.getPopularTags);

// GET all tags
router.get("/tags", jobController.getAllTags);

// GET by ID: public, nhưng nếu đã đăng nhập thì sẽ trả về thông tin yêu thích
router.get("/:id", authOptional, jobController.getJobById);

// Cập nhật công việc
router.put("/:id", authMiddleware, jobController.updateJob);

// DELETE công việc: chỉ cho phép người tạo hoặc admin
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  jobController.deleteJob,
);

// admin duyệt job
router.patch(
  "/admin/:id/approve",
  authMiddleware,
  authorizeRoles("admin"),
  jobController.approveJob,
);
router.patch(
  "/admin/:id/reject",
  authMiddleware,
  authorizeRoles("admin"),
  jobController.rejectJob,
);

// Build vector cho job
router.post(
  "/vector/rebuild/:id",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  jobController.buildJobVector,
);

module.exports = router;
