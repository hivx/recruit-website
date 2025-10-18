// controllers/jobController.js
const moment = require("moment");
const jobService = require("../services/jobService");
const userService = require("../services/userService");

// POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const jobData = req.body;
    jobData.createdBy = req.user.userId; // từ auth middleware
    // company_id: ưu tiên lấy từ body; nếu FE không gửi, dùng công ty của user
    jobData.company_id = jobData.company_id || req.user.companyId;

    const job = await jobService.createJob(jobData);
    res.status(201).json(job);
  } catch (err) {
    console.error("[Create Job Error]", err.message);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi server khi tạo việc làm!" });
  }
};

// GET /api/jobs (chỉ trả job approved)
exports.getAllJobs = async (req, res) => {
  try {
    const { tag, search = "", page = 1, limit = 10 } = req.query;

    const filter = {
      ...(tag ? { tags: Array.isArray(tag) ? tag : [tag] } : {}),
    };

    const result = await jobService.getAllJobs({
      filter,
      search,
      page: Number(page),
      limit: Number(limit),
    });

    res.json(result);
  } catch (err) {
    console.error("[Job List Error]", err.message);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách việc làm!" });
  }
};

// GET /api/jobs/:id (chỉ cho job approved)
exports.getJobById = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const job = await jobService.getJobById(Number(req.params.id), userId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy việc làm cho ID này!" });
    }

    let isFavorite = false;
    if (req.user) {
      const user = await userService.getUserById(req.user.userId);
      isFavorite = user?.favorites?.some(
        (fav) => fav.job_id === Number(job.id),
      );
    }

    res.json({
      ...job,
      createdAtFormatted: moment(job.created_at).format("DD/MM/YYYY HH:mm"),
      isFavorite,
    });
  } catch (err) {
    // jobService.getJobById sẽ ném lỗi 403 nếu chưa approved
    const code = err.statusCode || 500;
    console.error("[Get Job Detail Error]", err.message);
    res.status(code).json({ message: err.message || "Lỗi server!" });
  }
};

// GET /api/jobs/popular-tags
exports.getPopularTags = async (req, res) => {
  try {
    const tagStats = await jobService.getPopularTags();
    res.json(tagStats);
  } catch (err) {
    console.error("[Popular Tags Error]", err.message);
    res.status(500).json({ message: "Lỗi server khi thống kê tag!" });
  }
};

// GET /api/jobs/tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await jobService.getAllTags();
    res.json(tags);
  } catch (err) {
    console.error("[Get Tags Error]", err.message);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách tags!" });
  }
};

// PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const job = await jobService.getJobById(Number(req.params.id));
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy việc làm cho ID này!" });
    }

    if (job.created_by !== req.user.userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa công việc này!" });
    }

    const updatedJob = await jobService.updateJob(
      Number(req.params.id),
      req.body,
    );
    res.status(200).json(updatedJob);
  } catch (err) {
    console.error("[Update Job Error]", err.message);
    res.status(500).json({ message: "Lỗi server khi cập nhật công việc!" });
  }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await jobService.getJobById(Number(req.params.id));
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy việc làm cho ID này!" });
    }

    if (job.created_by !== req.user.userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa công việc này!" });
    }

    await jobService.deleteJob(Number(req.params.id));
    res.status(200).json({ message: "Xóa công việc thành công!" });
  } catch (err) {
    console.error("[Delete Job Error]", err.message);
    res.status(500).json({ message: "Lỗi server khi xóa công việc!" });
  }
};
