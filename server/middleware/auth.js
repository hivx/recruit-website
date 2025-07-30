const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối!' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    req.user = user; // 👈 Gán user đã xác thực
    next(); // 👈 Gọi tiếp sau khi có user
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token không hợp lệ!' });
  }
};

module.exports = authMiddleware;
