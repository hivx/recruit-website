const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Kiểm tra token có trong header không
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token, truy cập bị từ chối!' });
    }

    const token = authHeader.split(' ')[1];

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc thiếu userId!' });
    }

    // Tìm user trong database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }

    // Gán trả về thông tin người dùng vào req.user
    req.user = {
      userId: user._id,
      username: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    console.error('[AUTH ERROR]', err.message);
    return res.status(401).json({ message: 'Xác thực thất bại!' });
  }
};

module.exports = authMiddleware;
