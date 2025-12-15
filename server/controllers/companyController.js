// server/controllers/companyController.js
const companyService = require("../services/companyService");
const { cleanupUploadedFile } = require("../utils/cleanupUpload");

// POST /api/companies  (recruiter tạo company)
exports.createCompany = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Nếu có file → thêm logo
    if (req.file) {
      payload.logo = "uploads/" + req.file.filename;
    }

    // Validate required fields
    const required = [
      "legal_name",
      "registration_number",
      "country_code",
      "registered_address",
    ];

    for (const f of required) {
      if (!payload[f]) {
        cleanupUploadedFile(req);
        return res.status(400).json({ message: `Thiếu trường: ${f}` });
      }
    }

    const company = await companyService.createCompany(
      req.user.userId,
      payload,
    );

    res.status(201).json(company);
  } catch (err) {
    console.error("[Create Company]", err);
    cleanupUploadedFile(req); // xoá file nếu service fail
    res.status(err.status || 500).json({
      message: err.message || "Lỗi tạo công ty",
    });
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

// PATCH /api/companies/me  (recruiter cập nhật company của mình)
exports.updateMyCompany = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Có upload file mới?
    if (req.file) {
      payload.logo = "uploads/" + req.file.filename;
    }

    const company = await companyService.updateMyCompany(
      req.user.userId,
      payload,
    );

    res.json(company);
  } catch (err) {
    console.error("[Update My Company]", err);
    cleanupUploadedFile(req); // xoá file nếu service fail

    res.status(err.status || 500).json({
      message: err.message || "Lỗi cập nhật công ty",
    });
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
