// services/applicationService.js
const Application = require('../models/application');
const Job = require('../models/job');

exports.createApplication = async ({ jobId, coverLetter, userId }) => {
  // Kiểm tra job
  const job = await Job.findById(jobId);
  if (!job) {
    const error = new Error('Công việc không tồn tại!');
    error.statusCode = 404;
    throw error;
  }

  // Kiểm tra đã ứng tuyển
  const existing = await Application.findOne({ job: jobId, applicant: userId });
  if (existing) {
    const error = new Error('Bạn đã ứng tuyển công việc này rồi.');
    error.statusCode = 400;
    throw error;
  }

  // Tạo mới ứng tuyển
  const application = new Application({
    job: jobId,
    applicant: userId,
    coverLetter,
  });

  await application.save();
  return application;
};
