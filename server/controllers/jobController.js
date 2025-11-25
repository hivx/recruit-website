// controllers/jobController.js
const jobService = require("../services/jobService");
const jobVectorService = require("../services/jobVectorService");

const prisma = require("../utils/prisma");

/* ============================================================
   CREATE JOB
   ============================================================ */
exports.createJob = async (req, res) => {
  try {
    const jobData = req.body;
    jobData.createdBy = req.user.userId;
    jobData.company_id = jobData.company_id || req.user.companyId;

    // vẫn cho phép gửi thêm requiredSkills từ FE
    const job = await jobService.createJob(jobData);

    res.status(201).json(job);
  } catch (err) {
    console.error("[Create Job Error]", err.message);
    res.status(err.status || 500).json({ message: err.message });
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

/* ============================================================
   GET JOB BY ID
   ============================================================ */
exports.getJobById = async (req, res) => {
  try {
    const currentUser = req.user
      ? { id: req.user.userId, role: req.user.role }
      : null;
    const job = await jobService.getJobById(
      String(req.params.id),
      currentUser,
      {
        allowOwnerDraft: true,
      },
    );

    if (!job) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy việc làm cho ID này!" });
    }

    const isFavorite = currentUser
      ? !!(await prisma.userFavoriteJobs.findFirst({
          where: { user_id: BigInt(currentUser.id), job_id: BigInt(job.id) },
        }))
      : false;

    res.json({
      ...job,
      isFavorite,
    });
  } catch (err) {
    const code = err.statusCode || err.status || 500;
    console.error("[Get Job Detail Error]", err);
    res.status(code).json({ message: err.message });
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

/* ============================================================
   UPDATE JOB
   ============================================================ */
exports.updateJob = async (req, res) => {
  try {
    const idStr = String(req.params.id || "").trim();
    if (!/^\d+$/.test(idStr)) {
      return res.status(400).json({ message: "ID công việc không hợp lệ!" });
    }

    const currentUser = req.user
      ? { id: req.user.userId, role: req.user.role }
      : null;

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
        .json({ message: "Bạn không có quyền sửa công việc này!" });
    }

    const updatedJob = await jobService.updateJob(idStr, req.body);
    return res.status(200).json(updatedJob);
  } catch (err) {
    const code = err.statusCode || err.status || 500;
    console.error("[Update Job Error]", err);
    return res.status(code).json({ message: err.message });
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

/**
 * Build vector cho JOB
 */
exports.buildJobVector = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({ message: "Thiếu jobId!" });
    }

    const vector = await jobVectorService.buildJobVector(jobId);

    return res.json({
      message: "Vector job đã được cập nhật",
      vector,
    });
  } catch (err) {
    console.error("[BuildJobVector]", err);
    return res.status(500).json({ message: err.message || "Lỗi server" });
  }
};
