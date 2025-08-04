const jobService = require('../services/jobService');

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
    const { tag } = req.query;

    let filter = {};

    // Cho phép lọc theo tag hoặc nhiều tag (tag=IT&tag=Y tế)
    if (tag) {
      if (Array.isArray(tag)) {
        filter.tags = { $in: tag };
      } else {
        filter.tags = tag;
      }
    }

    const jobs = await jobService.getAllJobs(filter);
    res.json(jobs);
  } catch (err) {
    console.error('[Job List Error]', err.message);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách việc làm!' });
  }
};


// GET /api/jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy việc làm!' });
    }
    res.json(job);
  } catch (err) {
    console.error(err);
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
