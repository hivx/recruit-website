const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const jobController = require('../controllers/jobController');

// @route   POST /api/jobs
// @desc    Đăng tin tuyển dụng mới
// @access  Private
router.post('/', authMiddleware, jobController.createJob);

// @route   GET /api/jobs
// @desc    Lấy danh sách việc làm
// @access  Public
router.get('/', jobController.getAllJobs);

// @route   GET /api/jobs/:id
// @desc    Xem chi tiết 1 bài tuyển dụng
// @access  Public
router.get('/:id', jobController.getJobById);

module.exports = router;
