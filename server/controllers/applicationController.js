// controllers/applicationController.js
const applicationService = require('../services/applicationService');

exports.createApplication = async (req, res) => {
  const { jobId, coverLetter } = req.body;
  const userId = req.user.userId || req.user._id;

  try {
    const result = await applicationService.createApplication({ jobId, coverLetter, userId });
    res.status(201).json({ message: 'Ứng tuyển thành công!', application: result });
  } catch (err) {
    console.error('[ApplicationController]', err.message);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
