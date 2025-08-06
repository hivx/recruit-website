const moment = require('moment');
const jobService = require('../services/jobService');
const Job = require('../models/job');
const User = require('../models/user'); 

// POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const { tags = [], ...rest } = req.body;

    const jobData = {
      ...rest,
      tags,
      createdBy: req.user.userId,
      createdByName: req.user.fullName // lưu tên người tạo để hiển thị ngay cả khi tài khoản bị xóa
    };

    const newJob = await jobService.createJob(jobData);
    res.status(201).json(newJob);
  } catch (err) {
    console.error('[Job Create Error]', err.message);
    res.status(500).json({ message: 'Lỗi server khi đăng bài tuyển dụng!' });
  }
};

// GET /api/jobs
exports.getAllJobs = async (req, res) => {
  try {
    const { tag, search, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (tag) {
      filter.tags = Array.isArray(tag) ? { $in: tag } : tag;
    }

    const result = await jobService.getAllJobs({
      filter,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (err) {
    console.error('[Job List Error]', err.message);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách việc làm!' });
  }
};

// GET /api/jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy việc làm!' });
    }

    let isFavorite = false;
    if (req.user) {
      const user = await User.findById(req.user.userId);
      isFavorite = user?.favoriteJobs?.includes(req.params.id);
    }

    res.json({
      ...job.toObject(),
      createdAtFormatted: moment(job.createdAt).format('DD/MM/YYYY HH:mm'),
      isFavorite
    });
  } catch (err) {
    console.error('[Get Job Detail Error]', err.message);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// GET /api/jobs/popular-tags
exports.getPopularTags = async (req, res) => {
  try {
    const tagStats = await jobService.getPopularTags();
    res.json(tagStats);
  } catch (err) {
    console.error('[Popular Tags Error]', err.message);
    res.status(500).json({ message: 'Lỗi server khi thống kê tag!' });
  }
};

// GET /api/jobs/tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await jobService.getAllTags();
    res.json(tags);
  } catch (err) {
    console.error('[Get Tags Error]', err.message);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách tags!' });
  }
};

// PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy công việc!' });
    }

    console.log(job.createdBy, req.user.userId);
    // Kiểm tra nếu người dùng là người tạo hoặc admin
    if (job.createdBy.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền sửa công việc này' });
    }

    // Cập nhật các trường
    job.title = req.body.title || job.title;
    job.company = req.body.company || job.company;
    job.location = req.body.location || job.location;
    job.description = req.body.description || job.description;
    job.salary = req.body.salary || job.salary;
    job.requirements = req.body.requirements || job.requirements;
    job.tags = req.body.tags || job.tags;

    await job.save();
    res.status(200).json(job);
  } catch (err) {
    console.error('[Update Job Error]', err.message);
    res.status(500).json({ message: 'Lỗi server khi cập nhật công việc!' });
  }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy công việc!' });
    }

    // Kiểm tra nếu người dùng là người tạo hoặc admin
    if (job.createdBy.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa công việc này' });
    }

    await job.deleteOne();
    res.status(200).json({ message: 'Xóa công việc thành công!' });
  } catch (err) {
    console.error('[Delete Job Error]', err.message);
    res.status(500).json({ message: 'Lỗi server khi xóa công việc!' });
  }
};

