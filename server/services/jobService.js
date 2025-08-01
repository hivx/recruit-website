const Job = require('../models/job');

// Tạo job mới
exports.createJob = async (jobData) => {
  const job = new Job(jobData);
  return await job.save();
};

// Lấy danh sách jobs
exports.getAllJobs = async () => {
  return await Job.find().populate('createdBy', 'name email');
};

// Lấy job theo ID
exports.getJobById = async (id) => {
  return await Job.findById(id).populate('createdBy', 'name email');
};
