// controllers/userController.js
const userService = require('../services/userService');

exports.toggleFavoriteJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const jobId = req.params.jobId;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra job có trong favorites chưa
    const isFavorite = user.favorites.some(fav => fav.job_id === BigInt(jobId));

    if (!isFavorite) {
      await userService.addFavoriteJob(userId, jobId);
      return res.status(200).json({ message: 'Đã thêm vào danh sách yêu thích' });
    } else {
      await userService.removeFavoriteJob(userId, jobId);
      return res.status(200).json({ message: 'Đã gỡ khỏi danh sách yêu thích' });
    }
  } catch (err) {
    console.error('[Favorite Job Error]', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// GET /api/users/favorites
exports.getFavoriteJobs = async (req, res) => {
  try {
    const favorites = await userService.getFavoriteJobs(req.user.userId);
    const jobs = favorites.map(fav => fav.job); // lấy danh sách job từ quan hệ

    res.status(200).json(jobs);
  } catch (err) {
    console.error('[Get Favorite Jobs Error]', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
