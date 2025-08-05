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

// Lấy danh sách việc làm với các tùy chọn lọc, tìm kiếm và phân trang
exports.getAllJobs = async ({ filter = {}, search = '', page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const query = {
    ...filter,
    ...(search && {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    })
  };

  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Job.countDocuments(query);

  return { jobs, total, page, totalPages: Math.ceil(total / limit) };
};

// Lấy job theo ID
exports.getJobById = async (id) => {
  return await Job.findById(id).populate('createdBy', 'name email');
};

// Trả về danh sách tag phổ biến nhất
exports.getPopularTags = async () => {
  const result = await Job.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 } // lấy top 10
  ]);

  return result.map(r => ({ tag: r._id, count: r.count }));
};

// Lấy tất cả tag
exports.getAllTags = async () => {
  const result = await Job.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  return result.map(item => item._id);
};
