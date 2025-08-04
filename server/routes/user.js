// routes/userRoutes.js hoặc routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// POST: Thêm hoặc xóa công việc yêu thích
router.post('/favorite/:jobId', auth, userController.toggleFavoriteJob);

// GET: Lấy danh sách công việc yêu thích
router.get('/favorite', auth, userController.getFavoriteJobs);

module.exports = router;
