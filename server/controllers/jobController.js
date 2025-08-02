const jobService = require('../services/jobService');

// POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      createdBy: req.user.userId,
      createdByName: req.user.fullName // 👈 Lưu tên người tạo vào Job
    };
    const newJob = await jobService.createJob(jobData);
    res.status(201).json(newJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi đăng bài tuyển dụng!' });
  }
};

// GET /api/jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllJobs();
    res.json(jobs);
  } catch (err) {
    console.error(err);
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
