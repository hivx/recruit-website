const service = require("../services/skillService");

// GET /api/skills?q=
exports.listSkills = async (req, res) => {
  try {
    const skills = await service.listSkills(req.query.q || "");
    res.json(skills);
  } catch (err) {
    console.error("[List Skills]", err.message);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// GET /api/me/skills
exports.getMySkills = async (req, res) => {
  try {
    const skills = await service.getMySkills(req.user.userId);
    res.json({ total: skills.length, skills });
  } catch (err) {
    console.error("[Get My Skills]", err.message);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// PUT /api/me/skills
exports.addOrUpdate = async (req, res) => {
  try {
    const { name, level, years, note } = req.body || {};
    if (!name) {
      return res.status(400).json({ message: "Thiếu tên kỹ năng!" });
    }
    const result = await service.addOrUpdateUserSkill(req.user.userId, {
      name,
      level,
      years,
      note,
    });
    res.json(result);
  } catch (err) {
    console.error("[Upsert My Skill]", err.message);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// DELETE /api/me/skills/:skillId
exports.remove = async (req, res) => {
  try {
    const { skillId } = req.params;
    const result = await service.removeUserSkill(req.user.userId, skillId);
    res.json(result);
  } catch (err) {
    console.error("[Remove My Skill]", err.message);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
