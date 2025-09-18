// server/controllers/applicationController.js
const fs = require("fs");
const path = require("path");
const applicationService = require("../services/applicationService");

// POST: Ứng tuyển công việc (coverLetter, cv, phone bắt buộc)
exports.createApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, phone } = req.body;
    const userId = req.user.userId;

    // Validate cơ bản (chưa cần file)
    await applicationService.validateApply({
      jobId,
      userId,
      phone,
    });

    // Đảm bảo có file CV
    if (!req.file) {
      return res.status(400).json({ message: "Chưa tải lên file CV!" });
    }
    const cvPath = `uploads/${req.file.filename}`;

    // Tạo application
    const application = await applicationService.createApplication({
      jobId: BigInt(jobId),
      coverLetter,
      userId: BigInt(userId),
      cv: cvPath,
      phone,
    });

    res.status(201).json({
      message: "Ứng tuyển thành công!",
      application,
    });
  } catch (err) {
    console.error("[ApplicationController createApplication]", err.message);

    // Nếu có file nhưng lỗi thì rollback (xóa file)
    if (req.file) {
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Rollback xóa file thất bại:", unlinkErr);
        }
      });
    }

    res.status(err.statusCode || 500).json({
      message: err.message || "Lỗi server!",
    });
  }
};

// GET: Lấy danh sách ứng viên theo job
// Chỉ dành cho admin hoặc chủ job
exports.getApplicantsByJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const applications = await applicationService.getApplicationsByJob(jobId);

    if (!applications || applications.length === 0) {
      return res.status(404).json({
        message: "Không có ứng viên nào ứng tuyển cho công việc này!",
      });
    }

    res.json({
      totalApplicants: applications.length,
      applicants: applications.map((app) => ({
        applicantName: app.applicant.name,
        applicantEmail: app.applicant.email,
        coverLetter: app.cover_letter,
        cv: app.cv ? `http://localhost:5000/${app.cv}` : null,
        phone: app.phone,
        appliedAt: app.created_at,
      })),
    });
  } catch (err) {
    console.error("[Get Applicants By Job Error]", err.message);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách ứng viên!" });
  }
};
