// controllers/applicationController.js
const Application = require('../models/application');

// POST: Ứng tuyển công việc (bắt buộc cover letter, cv và phone)
exports.createApplication = async (req, res) => {
  const { jobId, coverLetter, phone } = req.body;
  const userId = req.user.userId || req.user._id;

  // Đảm bảo tệp CV đã được tải lên
  if (!req.file) {
    return res.status(400).json({ message: 'Chưa tải lên file CV' });
  }

  // Lưu thông tin ứng viên vào cơ sở dữ liệu
  try {
    const result = await Application.create({
      job: jobId,
      coverLetter,
      applicant: userId,
      cv: req.file.path,  // Lưu đường dẫn của file
      phone
    });

    res.status(201).json({ message: 'Ứng tuyển thành công!', application: result });
  } catch (err) {
    console.error('[ApplicationController]', err.message);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// GET: Lấy danh sách ứng viên đã ứng tuyển vào công việc
// Chỉ dành cho admin hoặc ứng viên đã ứng tuyển
exports.getApplicantsByJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Tìm tất cả các ứng viên đã ứng tuyển vào công việc này
    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'name email') // Populated thông tin ứng viên
      .populate('job', 'title company'); // Populated thông tin công việc

    if (applications.length === 0) {
      return res.status(404).json({ message: 'Không có ứng viên nào ứng tuyển cho công việc này.' });
    }

    res.json({
      totalApplicants: applications.length,
      applicants: applications.map(application => ({
        applicantName: application.applicant.name,
        applicantEmail: application.applicant.email,
        coverLetter: application.coverLetter,
        cv: `http://localhost:5000/uploads/${application.cv.split('uploads\\')[1]}`, // Đảm bảo trả về đường dẫn URL
        phone: application.phone,
        appliedAt: application.createdAt,
      })),
    });
  } catch (err) {
    console.error('[Get Applicants By Job Error]', err.message);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách ứng viên!' });
  }
};
