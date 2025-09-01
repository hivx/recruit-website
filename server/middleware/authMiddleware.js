const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token, truy cập bị từ chối!' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc thiếu userId!' });
    }

    // Prisma trả về BigInt → convert về string hoặc number
    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }

    req.user = {
      userId: user.id.toString(), // tránh lỗi JSON khi trả về
      username: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    next();
  } catch (err) {
    console.error('[AUTH ERROR]', err.message);
    return res.status(401).json({ message: 'Xác thực thất bại!' });
  }
};

module.exports = authMiddleware;
