// server/controllers/applicationController.js
const fs = require("node:fs");
const path = require("node:path");
const applicationService = require("../services/applicationService");
const { normalizeBigInt } = require("../utils/bigInt");
const prisma = require("../utils/prisma");

// POST: Ứng tuyển công việc (cv, phone, coverLetter theo business)
exports.createApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, phone } = req.body;
    const userId = req.user.userId;

    // Validate cơ bản (không phụ thuộc file)
    await applicationService.validateApply({
      jobId,
      userId,
      phone,
      coverLetter, // <-- BẮT BUỘC theo schema
    });

    // Đảm bảo có file CV (business rule)
    if (!req.file) {
      return res.status(400).json({ message: "Chưa tải lên file CV!" });
    }
    const cvPath = `uploads/${req.file.filename}`;

    // Tạo application — để service tự BigInt hoá id
    const application = await applicationService.createApplication({
      jobId,
      coverLetter,
      userId,
      cv: cvPath,
      phone,
    });

    return res.status(201).json({
      message: "Ứng tuyển thành công!",
      application,
    });
  } catch (err) {
    console.error("[ApplicationController createApplication]", err.message);

    // Rollback file nếu có
    if (req.file) {
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Rollback xóa file thất bại:", unlinkErr);
        }
      });
    }

    return res.status(err.statusCode || 500).json({
      message: err.message || "Lỗi server!",
    });
  }
};

// GET: Lấy danh sách ứng viên theo job
// Chỉ dành cho admin hoặc chủ job
exports.getApplicantsByJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // 1) Lấy job & kiểm quyền trước
    const job = await prisma.job.findUnique({
      where: { id: BigInt(jobId) },
      select: { id: true, created_by: true },
    });
    if (!job) {
      return res.status(404).json({ message: "Không tìm thấy công việc!" });
    }

    const isOwner = job.created_by?.toString() === req.user.userId?.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cho công việc này!" });
    }

    // 2) Lấy danh sách ứng viên (DTO đã include applicant)
    const applications = await applicationService.getApplicationsByJob(jobId);

    // 3) Trả về dữ liệu (kể cả rỗng)
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return res.json({
      totalApplicants: applications.length,
      applicants: applications.map((app) => ({
        applicantName: app.applicant?.name || null,
        applicantEmail: app.applicant?.email || null,
        coverLetter: app.cover_letter,
        cv: app.cv ? `${baseUrl}/${app.cv}` : null,
        phone: app.phone,
        appliedAt: app.created_at,
        status: app.status, // theo schema ApplicationStatus
        fitScore: app.fit_score, // nếu bạn dùng field này
      })),
    });
  } catch (err) {
    console.error("[Get Applicants By Job Error]", err.message);
    return res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách ứng viên!" });
  }
};

// GET /api/applications/me
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await applicationService.getApplicationsByUser(
      req.user.userId,
    );
    return res.json(
      normalizeBigInt({ total: apps.length, applications: apps }),
    );
  } catch (err) {
    console.error("[Get My Applications]", err.message);
    return res.status(500).json({ message: "Lỗi server!" });
  }
};

// PATCH /api/applications/:id/review
exports.reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewer = {
      id: req.user.userId,
      role: req.user.role,
    };
    const { status, note } = req.body;

    const result = await applicationService.reviewApplication(id, reviewer, {
      status,
      note,
    });

    return res.status(200).json({
      message: "Đánh giá hồ sơ thành công!",
      application: result,
    });
  } catch (err) {
    console.error("[Review Application Error]", err);
    const code = err.status || 500;
    res.status(code).json({ message: err.message || "Lỗi đánh giá hồ sơ!" });
  }
};

// PUT /api/applications/:id
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const body = req.body;

    // payload: chỉ có field nào FE gửi thì mới có
    const payload = {};

    if (body.coverLetter !== undefined) {
      payload.cover_letter = body.coverLetter;
    }
    if (body.phone !== undefined) {
      payload.phone = body.phone;
    }
    if (file) {
      payload.cv = `uploads/${file.filename}`;
    }

    const result = await applicationService.updateApplication(
      id,
      req.user,
      payload,
    );

    res.status(200).json({
      message: "Cập nhật hồ sơ ứng tuyển thành công!",
      application: result,
    });
  } catch (err) {
    console.error("[Update Application Error]", err);
    const code = err.status || 500;
    res.status(code).json({ message: err.message || "Lỗi cập nhật hồ sơ!" });
  }
};
