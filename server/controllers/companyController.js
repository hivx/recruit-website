// controllers/companyController.js
const companyService = require("../services/companyService");

// POST /api/companies  (recruiter tạo company)
exports.createCompany = async (req, res) => {
  try {
    // req.user.userId và req.user.role đã có từ authMiddleware
    if (req.user.role !== "recruiter" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ recruiter mới được tạo công ty" });
    }

    const required = [
      "legal_name",
      "registration_number",
      "country_code",
      "registered_address",
    ];
    for (const f of required) {
      if (!req.body[f]) {
        return res.status(400).json({ message: `Thiếu trường bắt buộc: ${f}` });
      }
    }

    const company = await companyService.createCompany(
      req.user.userId,
      req.body,
    );
    res.status(201).json(company);
  } catch (err) {
    console.error("[Create Company]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi tạo công ty" });
  }
};

// GET /api/companies/me  (recruiter xem company của mình)
exports.getMyCompany = async (req, res) => {
  try {
    const company = await companyService.getMyCompany(req.user.userId);
    if (!company) {
      return res.status(404).json({ message: "Bạn chưa có công ty" });
    }
    res.json(company);
  } catch (err) {
    console.error("[Get My Company]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi lấy công ty" });
  }
};

// PATCH /api/companies/me  (recruiter cập nhật công ty của mình)
exports.updateMyCompany = async (req, res) => {
  try {
    const company = await companyService.updateMyCompany(
      req.user.userId,
      req.body,
    );
    res.json(company);
  } catch (err) {
    console.error("[Update My Company]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi cập nhật công ty" });
  }
};

// POST /api/companies/me/submit  (recruiter nộp xét duyệt lại)
exports.submitForReview = async (req, res) => {
  try {
    const result = await companyService.submitForReview(req.user.userId);
    res.json(result);
  } catch (err) {
    console.error("[Submit Company Verification]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi nộp xét duyệt" });
  }
};

// PATCH /api/admin/company/:id/verify  (admin duyệt hoặc từ chối)
exports.verifyCompany = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin được duyệt công ty" });
    }
    const companyId = req.params.id;
    const { status, reason } = req.body || {};
    const result = await companyService.verifyCompany(
      companyId,
      req.user.userId,
      { status, reason },
    );
    res.json(result);
  } catch (err) {
    console.error("[Admin Verify Company]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi duyệt công ty" });
  }
};
