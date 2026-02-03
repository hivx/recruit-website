// server/middleware/requireRecruiterWithVerifiedCompany.js
const prisma = require("../utils/prisma");

module.exports = async function requireRecruiterWithVerifiedCompany(
  req,
  res,
  next,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const { userId, role } = req.user;

    // 1. Admin bỏ qua kiểm tra
    if (role === "admin") {
      return next();
    }

    // 2. Chỉ recruiter mới được phép
    if (role !== "recruiter") {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện thao tác này!",
      });
    }

    // 3. QUERY COMPANY TỪ DB (BẮT BUỘC)
    const company = await prisma.company.findUnique({
      where: {
        owner_id: BigInt(userId),
      },
      include: {
        verification: true,
      },
    });

    if (!company) {
      return res.status(403).json({
        message: "Vui lòng tạo công ty trước",
      });
    }

    if (company.verification?.status !== "verified") {
      return res.status(403).json({
        message: "Công ty chưa được xác thực",
      });
    }

    // 4. GẮN BUSINESS CONTEXT
    req.company = company;

    return next();
  } catch (err) {
    console.error("[Require Recruiter With Verified Company Error]", err);
    return res.status(500).json({
      message: "Lỗi kiểm tra công ty",
    });
  }
};
