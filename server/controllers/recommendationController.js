// server/controllers/recommendationController.js
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

/// GET /api/recommendations/:userId
async function getRecommendedJobs(req, res) {
  try {
    const userId = req.params.userId;
    const currentUser = Number(req.user?.userId);
    const userRole = req.user?.role;

    // Không cho xem recommend của người khác (trừ admin)
    const isOwner = userId === String(currentUser);
    if (!isOwner && userRole !== "admin") {
      return res.status(403).json({ error: "Không được phép truy cập!" });
    }

    // ===== Parse Query Params =====
    const min_score = Number(req.query.min_score ?? 0);
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const location = (req.query.location ?? "").trim();

    // Xử lý tag → array
    let tags = [];
    const tag = req.query.tag;

    if (Array.isArray(tag)) {
      tags = tag;
    } else if (typeof tag === "string" && tag.trim() !== "") {
      tags = [tag];
    }

    // ===== Gọi service =====
    const result = await recommendationService.getRecommendedJobsForUser(
      userId,
      { min_score, location, tags, page, limit },
    );

    return res.json(normalizeBigInt(result));
  } catch (err) {
    console.error("[Get Recommended Jobs Error]", err);
    res.status(400).json({ error: err.message });
  }
}

// GET /api/recommendations/recruiter/:recruiterId
async function getRecommendedCandidates(req, res) {
  try {
    const recruiterId = req.params.recruiterId;
    const {
      min_score = 0,
      page = 1,
      limit = 10,
      location = "",
      tag,
    } = req.query;

    let tags = [];
    if (Array.isArray(tag)) {
      tags = tag;
    } else if (tag) {
      tags = [tag];
    }

    const result =
      await recommendationService.getRecommendedCandidatesForRecruiter(
        recruiterId,
        {
          min_score: Number(min_score),
          location,
          tags,
          page: Number(page),
          limit: Number(limit),
        },
      );

    res.json(normalizeBigInt(result));
  } catch (err) {
    console.error("[Get Recommended Candidate Error]", err);
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  jobRecommendations,
  recommendCandidates,
  getRecommendedJobs,
  getRecommendedCandidates,
};
