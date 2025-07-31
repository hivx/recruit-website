const express = require('express');
const router = express.Router();
const Application = require('../models/application');
const Job = require('../models/job');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/applications
// @desc    Ứng tuyển vào một công việc
// @access  Private
router.post('/', auth, async (req, res) => {
  const { jobId, coverLetter } = req.body;
  console.log('👉 req.user:', req.user); // Xem có _id không

  try {
    // Kiểm tra job có tồn tại không
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Công việc không tồn tại!' });

    // Kiểm tra nếu đã ứng tuyển
    const existing = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã ứng tuyển công việc này rồi.' });
    }

    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
    });

    await application.save();
    res.status(201).json({ message: 'Ứng tuyển thành công!', application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

module.exports = router;
