// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không có token!" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.userId) {
      return res.status(401).json({ message: "Token thiếu userId!" });
    }

    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.userId) },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        role: true,
        isVerified: true,
        company: {
          select: {
            id: true,
            legal_name: true,
            verification: { select: { status: true } },
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    req.user = {
      userId: user.id.toString(),
      username: user.name,
      avatar: user.avatar,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      companyId: user.company?.id?.toString() ?? null,
      companyName: user.company?.legal_name ?? null,
      isCompanyVerified: user.company?.verification?.status === "verified",
    };
    next();
  } catch (err) {
    console.error("[AUTH ERROR]", err.message);
    return res.status(401).json({ message: "Xác thực thất bại!" });
  }
};
