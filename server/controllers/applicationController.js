// controllers/applicationController.js
const applicationService = require("../services/applicationService");

// POST: Ứng tuyển công việc (coverLetter, cv, phone bắt buộc)
exports.createApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, phone } = req.body;
    const userId = req.user.userId;

    // Đảm bảo CV đã được upload
    if (!req.file) {
      return res.status(400).json({ message: "Chưa tải lên file CV" });
    }
    const cvPath = `uploads/${req.file.filename}`; // nếu có file upload (avatar) thì lấy path

    const application = await applicationService.createApplication({
      jobId: BigInt(jobId),
      coverLetter,
      userId: BigInt(userId),
      cv: cvPath, // đường dẫn file
      phone,
    });

    res.status(201).json({
      message: "Ứng tuyển thành công!",
      application,
    });
  } catch (err) {
    console.error("[ApplicationController createApplication]", err.message);
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
        message: "Không có ứng viên nào ứng tuyển cho công việc này.",
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
