const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/jobs
// @desc    Đăng tin tuyển dụng mới
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { title, company, location, description, salary, requirements } = req.body;

  try {
    const newJob = new Job({
      title,
      company,
      location,
      description,
      salary,
      requirements,
      createdBy: req.user.userId
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi đăng bài tuyển dụng!' });
  }
});

// @route   GET /api/jobs
// @desc    Lấy danh sách việc làm
// @access  Public
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('createdBy', 'name email');
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách việc làm!' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Xem chi tiết 1 bài tuyển dụng
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy việc làm!' });
    }

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

module.exports = router;
