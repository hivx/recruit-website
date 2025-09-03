// routes/userRoutes.js hoặc routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// PUT: Cập nhật thông tin cá nhân
router.put('/me', auth, userController.updateProfile);

// Đổi mật khẩu (chỉ user đã đăng nhập mới được)
router.put('/change-password', auth, userController.changePassword);

// GET: Lấy danh sách công việc yêu thích
router.get('/favorite', auth, userController.getFavoriteJobs);

// POST: Thêm hoặc xóa công việc yêu thích
router.post('/favorite/:jobId', auth, userController.toggleFavoriteJob);

module.exports = router;
