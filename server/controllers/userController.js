const User = require('../models/user');

// controllers/userController.js
exports.toggleFavoriteJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    const index = user.favoriteJobs.indexOf(jobId);
    if (index === -1) {
      user.favoriteJobs.push(jobId);
      await user.save();
      return res.status(200).json({ message: 'Đã thêm vào danh sách yêu thích' });
    } else {
      user.favoriteJobs.splice(index, 1);
      await user.save();
      return res.status(200).json({ message: 'Đã gỡ khỏi danh sách yêu thích' });
    }
  } catch (err) {
    console.error('[Favorite Job Error]', err.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// GET /api/users/favorite
exports.getFavoriteJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('favoriteJobs');
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    res.status(200).json(user.favoriteJobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
