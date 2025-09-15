// routes/userRoutes.js hoặc routes/favoriteRoutes.js
const express = require("express");

const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");
const uploadAvatar = require("../utils/uploadAvatar");

// PUT: Cập nhật avatar user
router.put(
  "/me",
  auth,
  uploadAvatar.single("avatar"), // nếu FE gửi avatar
  userController.updateProfile,
);

// Đổi mật khẩu (chỉ user đã đăng nhập mới được)
router.put("/change-password", auth, userController.changePassword);

// GET: Lấy danh sách công việc yêu thích
router.get("/favorite", auth, userController.getFavoriteJobs);

// POST: Thêm hoặc xóa công việc yêu thích
router.post("/favorite/:jobId", auth, userController.toggleFavoriteJob);

module.exports = router;
