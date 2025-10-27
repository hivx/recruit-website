const preferenceService = require("../services/preferenceService");

// GET /api/me/career-preference
exports.getCareerPreference = async (req, res) => {
  try {
    const data = await preferenceService.getCareerPreference(req.user.userId);
    return res.json(data || {});
  } catch (err) {
    console.error("[Get CareerPref]", err.message);
    return res.status(500).json({ message: "Lỗi server!" });
  }
};

// PUT /api/me/career-preference
exports.upsertCareerPreference = async (req, res) => {
  try {
    const data = await preferenceService.upsertCareerPreference(
      req.user.userId,
      req.body,
    );
    return res.json({ message: "Lưu tiêu chí nghề nghiệp thành công!", data });
  } catch (err) {
    console.error("[Upsert CareerPref]", err.message);
    return res.status(500).json({ message: "Lỗi server!" });
  }
};

// GET /api/recruiter/preferences/me
exports.getMyRecruiterPref = async (req, res) => {
  try {
    if (req.user.role !== "recruiter" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ nhà tuyển dụng hoặc admin!" });
    }
    const data = await preferenceService.getRecruiterPreference(
      req.user.userId,
    );
    return res.json(data || {});
  } catch (err) {
    console.error("[Get Recruiter Pref]", err.message);
    return res.status(500).json({ message: "Lỗi server!" });
  }
};

// PUT /api/recruiter/preferences/me
exports.upsertMyRecruiterPref = async (req, res) => {
  try {
    if (req.user.role !== "recruiter" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ nhà tuyển dụng hoặc admin!" });
    }
    const data = await preferenceService.upsertRecruiterPreference(
      req.user.userId,
      req.body,
    );
    return res.json({
      message: "Lưu tiêu chí nhà tuyển dụng thành công",
      data,
    });
  } catch (err) {
    console.error("[Upsert Recruiter Pref]", err.message);
    return res.status(500).json({ message: "Lỗi server!" });
  }
};
