const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const authOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: BigInt(decoded.userId) },
        select: { id: true, role: true },
      });

      if (user) {
        req.user = {
          userId: user.id.toString(), // BigInt → string
          role: user.role,
        };
      }
    }
  } catch (err) {
    console.error("[AUTH OPTIONAL ERROR]", err.message);
    // khác với authMiddleware: không return res.status(401)
    // chỉ bỏ qua và cho đi tiếp
  }

  next();
};

module.exports = authOptional;
