// server/routes/user.js
const express = require("express");

const router = express.Router();
const profileController = require("../controllers/profileController");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const uploadAvatar = require("../utils/uploadAvatar");

// PUT: Cập nhật avatar user
router.put(
  "/me",
  authMiddleware,
  uploadAvatar.single("avatar"), // nếu FE gửi avatar
  userController.updateProfile,
);

// Đổi mật khẩu (chỉ user đã đăng nhập mới được)
router.put("/change-password", authMiddleware, userController.changePassword);

// GET: Lấy danh sách công việc yêu thích
router.get("/favorite", authMiddleware, userController.getFavoriteJobs);

// POST: Thêm hoặc xóa công việc yêu thích
router.post(
  "/favorite/:jobId",
  authMiddleware,
  userController.toggleFavoriteJob,
);

// GET: Lấy hồ sơ hành vi của chính mình
router.get("/behavior-profile", authMiddleware, profileController.getMyProfile);

// POST: Xây dựng lại hồ sơ hành vi cho chính mình
router.post(
  "/behavior-profile/rebuild",
  authMiddleware,
  profileController.rebuildMyProfile,
);

router.post(
  "/vector/rebuild",
  authMiddleware, // hoặc auth, tuỳ bạn đang dùng gì cho JWT
  userController.rebuildUserVector,
);

// POST: Xây dựng vector cho recruiter (admin/recruiter) mới được phép thực hiện
router.post(
  "/vector/recruiter/:userId",
  authMiddleware,
  authorizeRoles("recruiter", "admin"),
  userController.rebuildRecruiterVector,
);

// PATCH: Cập nhật tùy chọn nhận gợi ý
router.patch(
  "/me/recommendations",
  authMiddleware,
  userController.updateReceiveRecommendation,
);

// ================================
// ADMIN USER ROUTES
// ================================

// Tất cả route bên dưới đều:
// - đã đăng nhập
// - role = admin
router.use(authMiddleware);
router.use(authorizeRoles("admin"));

/**
 * ADMIN: Tạo user mới
 * POST /api/users/admin/users
 */
router.post("/admin/users", userController.adminCreateUser);

/**
 * ADMIN: Lấy danh sách user
 * GET /api/users/admin/users
 * Query: role, isVerified, page, limit
 */
router.get("/admin/users", userController.adminListUsers);

/**
 * ADMIN: Cập nhật user (name, role, isVerified)
 * PUT /api/users/admin/users/:id
 */
router.put("/admin/users/:id", userController.adminUpdateUser);

/**
 * ADMIN: Active / Deactive user
 * PATCH /api/users/admin/users/:id/status
 * Body: { isActive: true | false }
 */
router.patch("/admin/users/:id/status", userController.adminSetUserActive);

/**
 * ADMIN: Xóa user (chỉ khi chưa phát sinh dữ liệu)
 * DELETE /api/users/admin/users/:id
 */
router.delete("/admin/users/:id", userController.adminDeleteUser);

module.exports = router;
