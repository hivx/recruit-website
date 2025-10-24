// controllers/jobController.js
const moment = require("moment");
const jobService = require("../services/jobService");
const prisma = require("../utils/prisma");

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
    const currentUser = req.user
      ? { id: req.user.userId, role: req.user.role }
      : null;

    // ĐỪNG ép Number ở đây; để service tự BigInt()
    const job = await jobService.getJobById(
      String(req.params.id),
      currentUser,
      { allowOwnerDraft: true },
    );

    // service sẽ ném 404/403 khi cần, nên if (!job) gần như không chạy tới
    // nhưng vẫn giữ cho an toàn:
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy việc làm cho ID này!" });
    }

    // Tính isFavorite nhẹ nhàng, không cần kéo cả user + favorites
    let isFavorite = false;
    if (currentUser) {
      const fav = await prisma.userFavoriteJobs.findFirst({
        where: {
          user_id: BigInt(currentUser.id),
          job_id: BigInt(job.id), // job.id là string từ DTO -> ép BigInt an toàn
        },
        select: { user_id: true },
      });
      isFavorite = !!fav;
    }

    res.json({
      ...job,
      createdAtFormatted: moment(job.created_at).format("DD/MM/YYYY HH:mm"),
      isFavorite,
    });
  } catch (err) {
    const code = err.statusCode || err.status || 500;
    console.error("[Get Job Detail Error]", err);
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
    const idStr = String(req.params.id || "").trim();
    if (!/^\d+$/.test(idStr)) {
      return res.status(400).json({ message: "ID công việc không hợp lệ!" });
    }

    const currentUser = req.user
      ? { id: req.user.userId, role: req.user.role }
      : null;

    // Cho phép chủ job/admin thao tác cả khi job chưa approved
    const job = await jobService.getJobById(idStr, currentUser, {
      allowOwnerDraft: true,
    });

    // Nếu service return null (dù bình thường sẽ throw 404/403)
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy việc làm cho ID này!" });
    }

    const isOwner = String(job.created_by) === String(req.user.userId);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa công việc này!" });
    }

    const updatedJob = await jobService.updateJob(idStr, req.body);
    return res.status(200).json(updatedJob);
  } catch (err) {
    const code = err.statusCode || err.status || 500;
    console.error("[Update Job Error]", err);
    return res
      .status(code)
      .json({ message: err.message || "Lỗi server khi cập nhật công việc!" });
  }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const idStr = String(req.params.id || "").trim();
    if (!/^\d+$/.test(idStr)) {
      return res.status(400).json({ message: "ID công việc không hợp lệ!" });
    }

    const currentUser = req.user
      ? { id: req.user.userId, role: req.user.role }
      : null;

    // Lấy job để kiểm quyền (cho phép chủ job/admin xem draft)
    const job = await jobService.getJobById(idStr, currentUser, {
      allowOwnerDraft: true,
    });
    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy việc làm cho ID này!" });
    }

    const isOwner = String(job.created_by) === String(req.user.userId);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa công việc này!" });
    }

    await jobService.deleteJob(idStr); // service tự BigInt hoá
    return res.status(200).json({ message: "Xóa công việc thành công!" });
  } catch (err) {
    const code = err.statusCode || err.status || 500;
    console.error("[Delete Job Error]", err);
    return res
      .status(code)
      .json({ message: err.message || "Lỗi server khi xóa công việc!" });
  }
};

// ADMIN: approve job
exports.approveJob = async (req, res) => {
  try {
    const jobId = String(req.params.id);
    const adminId = req.user.userId;

    const result = await jobService.approveJob(jobId, adminId);
    res.json(result);
  } catch (err) {
    console.error("[Approve Job]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi duyệt job" });
  }
};

// ADMIN: reject job
exports.rejectJob = async (req, res) => {
  try {
    const jobId = String(req.params.id);
    const adminId = req.user.userId;
    const reason = req.body.reason || "Không đạt yêu cầu";

    const result = await jobService.rejectJob(jobId, adminId, reason);
    res.json(result);
  } catch (err) {
    console.error("[Reject Job]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi từ chối job" });
  }
};
