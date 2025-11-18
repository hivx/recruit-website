const {
  generateRecommendationsForUser,
} = require("../services/recommendationService");

async function getRecommendations(req, res) {
  try {
    const userId = req.params.userId;

    const data = await generateRecommendationsForUser(userId);

    return res.json({
      message: "Đã sinh công việc gợi ý cho người dùng",
      data,
    });
  } catch (error) {
    console.error("[getRecommendations]", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

module.exports = {
  getRecommendations,
};
