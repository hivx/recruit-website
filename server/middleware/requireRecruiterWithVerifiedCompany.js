// middleware/requireRecruiterWithVerifiedCompany.js
module.exports = function requireRecruiterWithVerifiedCompany(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  const { role, companyId, isCompanyVerified } = req.user;

  // Admin bỏ qua kiểm tra
  if (role === "admin") {
    return next();
  }

  // Recruiter phải thoả 2 điều kiện dưới
  if (role !== "recruiter") {
    return res.status(403).json({ message: "Chỉ recruiter mới được thao tác" });
  }

  if (!companyId) {
    return res.status(403).json({ message: "Vui lòng tạo công ty trước" });
  }

  if (!isCompanyVerified) {
    return res.status(403).json({ message: "Công ty chưa được xác thực" });
  }

  return next();
};
