const recommendationService = require("../services/recommendationService");
const { normalizeBigInt } = require("../utils/bigInt");

async function jobRecommendations(req, res) {
  try {
    const userId = req.params.userId;

    const data =
      await recommendationService.generateRecommendationsForUser(userId);

    return res.json({
      message: "Đã sinh công việc gợi ý cho người dùng",
      data: normalizeBigInt(data),
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
}

async function recommendCandidates(req, res) {
  try {
    const recruiterId = req.params.userId;

    const data =
      await recommendationService.generateCandidateRecommendations(recruiterId);

    res.json({
      message: "Đề xuất ứng viên thành công",
      data: normalizeBigInt(data),
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
}

module.exports = {
  jobRecommendations,
  recommendCandidates,
};
