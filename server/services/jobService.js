const Job = require('../models/job');

exports.createJob = async (jobData) => {
  // Nếu chưa có createdByName thì lấy từ createdBy
  if (!jobData.createdByName && jobData.createdBy) {
    const user = await require('../models/user').findById(jobData.createdBy);
    if (user) {
      jobData.createdByName = user.name;
    }
  }

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
