// server/controllers/recommendSystemController.js
const recommendSystemService = require("../services/recommendSystemService");

/**
 * ADMIN: Trigger gửi email đề xuất job cho ứng viên
 * Có thể dùng để test hoặc chạy thủ công
 */
exports.sendJobRecommendations = async (req, res, next) => {
  try {
    const { minFitScore, limitPerUser } = req.body || {};

    const result = await recommendSystemService.sendJobRecommendations({
      minFitScore,
      limitPerUser,
    });

    return res.json({
      message: "Gửi đề xuất job thành công.",
      result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Trigger gửi email đề xuất ỨNG VIÊN cho nhà tuyển dụng
 * Có thể dùng để test hoặc chạy thủ công
 */
exports.sendCandidateRecommendations = async (req, res, next) => {
  try {
    const { minFitScore, limitPerRecruiter } = req.body || {};

    const result = await recommendSystemService.sendCandidateRecommendations({
      minFitScore,
      limitPerRecruiter,
    });

    return res.json({
      message: "Gửi đề xuất ứng viên cho nhà tuyển dụng thành công.",
      result,
    });
  } catch (err) {
    next(err);
  }
};
