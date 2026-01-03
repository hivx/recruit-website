// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
// Nếu muốn chặn user đã bị xoá/ban, bật prisma và check dưới (tuỳ chọn)
// const prisma = require("../utils/prisma");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Không có token!" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      // phân biệt lỗi hết hạn vs không hợp lệ (cho dev debug dễ hơn)
      const msg =
        e.name === "TokenExpiredError"
          ? "Token đã hết hạn!"
          : "Token không hợp lệ!";
      return res.status(401).json({ message: msg });
    }

    if (!decoded?.userId || !decoded?.role) {
      return res
        .status(401)
        .json({ message: "Token thiếu thông tin cần thiết!" });
    }

    // Gắn claim tối thiểu — KHÔNG phẳng hoá company/user ở đây
    req.user = {
      userId: decoded.userId.toString
        ? decoded.userId.toString()
        : `${decoded.userId}`,
      role: decoded.role,
    };

    return next();
  } catch (err) {
    console.error("[AUTH ERROR]", err);
    return res.status(401).json({ message: "Xác thực thất bại!" });
  }
};
