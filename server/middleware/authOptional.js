// server/middleware/authOptional.js
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

module.exports = async function authOptional(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: BigInt(decoded.userId) },
        select: {
          id: true,
          role: true,
          company: {
            select: { id: true, verification: { select: { status: true } } },
          },
        },
      });

      if (user) {
        req.user = {
          userId: user.id.toString(),
          role: user.role,
          companyId: user.company?.id?.toString() ?? null,
          isCompanyVerified: user.company?.verification?.status === "verified",
        };
      }
    }
  } catch (err) {
    console.error("[AUTH OPTIONAL ERROR]", err.message);
  }
  next();
};
