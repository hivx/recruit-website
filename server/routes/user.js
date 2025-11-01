// routes/userRoutes.js hoặc routes/favoriteRoutes.js
const express = require("express");

const router = express.Router();
const profileController = require("../controllers/profileController");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
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

module.exports = router;
