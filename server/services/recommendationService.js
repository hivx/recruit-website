// server/services/recommendationService.js
const {
  computeJobFitScore,
  computeCandidateFitScore,
} = require("../utils/fitScore");
const prisma = require("../utils/prisma");

function formatScorePercent(score) {
  return `${Math.round(score * 100)}%`;
}

function mapNames(map, ids) {
  if (!Array.isArray(ids)) {
    return [];
  }

  return ids.map((id) => map.get(id)).filter(Boolean);
}

async function buildLookupMaps() {
  const [skills, tags] = await Promise.all([
    prisma.skill.findMany({ select: { id: true, name: true } }),
    prisma.tag.findMany({ select: { id: true, name: true } }),
  ]);

  const skillMap = new Map(skills.map((s) => [s.id, s.name]));
  const tagMap = new Map(tags.map((t) => [t.id, t.name]));

  return { skillMap, tagMap };
}

function formatOverall(score, overall) {
  const labelMap = {
    high: "Cao",
    medium: "Trung bình",
    low: "Thấp",
  };

  const label = labelMap[overall] ?? "Thấp";

  return `Mức độ phù hợp: ${label} (${formatScorePercent(score)})`;
}

function buildJobReasonFromExplanation(expl, score, skillMap, tagMap) {
  const lines = [];

  // ===== SKILL =====
  lines.push(formatOverall(score, expl.overall), "", "Kỹ năng:");

  const matchedSkills = mapNames(skillMap, expl.skills.matched);
  const missingMustSkills = mapNames(skillMap, expl.skills.missingMust);

  if (expl.skills.matchedMustCount > 0) {
    lines.push(
      `- Đã đáp ứng ${expl.skills.matchedMustCount}/${expl.skills.mustCount} kỹ năng bắt buộc: ${matchedSkills.join(", ")}`,
    );
  }

  if (missingMustSkills.length > 0) {
    lines.push(`- Chưa có kỹ năng bắt buộc: ${missingMustSkills.join(", ")}`);
  }

  if (expl.skills.matchedOptionalCount > 0) {
    lines.push(
      `- Có thêm kỹ năng bổ trợ: ${matchedSkills
        .slice(expl.skills.matchedMustCount)
        .join(", ")}`,
    );
  }

  // ===== 3. TAGS / INDUSTRY =====
  lines.push("", "Lĩnh vực:");

  if (!expl.tags.hasData) {
    lines.push("- Chưa đủ dữ liệu lĩnh vực để so khớp");
  } else if (expl.tags.matched.length > 0) {
    const tagNames = mapNames(tagMap, expl.tags.matched);
    lines.push(`- Phù hợp với lĩnh vực: ${tagNames.join(", ")}`);
  } else {
    lines.push("- Chưa trùng với các lĩnh vực bạn quan tâm");
  }

  // ===== 4. SALARY =====
  lines.push("", "Lương:");

  if (!expl.salary.comparable) {
    lines.push("- Chưa đủ dữ liệu để so sánh mức lương");
  } else if (expl.salary.level === "higher") {
    lines.push("- Mức lương cao hơn kỳ vọng của bạn (điểm cộng)");
  } else if (expl.salary.level === "near") {
    lines.push("- Mức lương tiệm cận kỳ vọng của bạn");
  } else {
    lines.push("- Mức lương thấp hơn kỳ vọng của bạn");
  }

  // ===== 5. LOCATION =====
  lines.push("", "Địa điểm:");

  if (expl.location.level === "match") {
    lines.push("- Phù hợp với khu vực làm việc bạn ưu tiên");
  } else {
    lines.push("- Chưa trùng hoàn toàn khu vực ưu tiên");
  }

  // ===== 6. SUGGESTION =====
  lines.push("", "Gợi ý:");

  if (expl.overall === "high") {
    lines.push(
      "- Đây là vị trí phù hợp với hồ sơ hiện tại, bạn nên xem chi tiết và cân nhắc ứng tuyển.",
    );
  } else if (missingMustSkills.length > 0) {
    lines.push(
      `- Bổ sung kỹ năng ${missingMustSkills.join(
        ", ",
      )} sẽ giúp hồ sơ phù hợp hơn trong tương lai.`,
    );
  } else {
    lines.push(
      "- Bạn có thể điều chỉnh kỳ vọng hoặc bổ sung thêm kỹ năng để tăng mức độ phù hợp.",
    );
  }

  return lines.join("\n");
}

/**
 * Sinh gợi ý JOB cho USER → ghi vào bảng job_recommendations
 */
async function generateRecommendationsForUser(userId) {
  const uid = BigInt(userId);

  const userVector = await prisma.userVector.findUnique({
    where: { user_id: uid },
  });

  if (!userVector) {
    throw new Error("User vector không tồn tại");
  }

  const jobVectors = await prisma.jobVector.findMany({
    where: { job: { approval: { status: "approved" } } },
  });
  if (!jobVectors.length) {
    throw new Error("Không có job vector nào để đề xuất");
  }

  const results = [];

  const { skillMap, tagMap } = await buildLookupMaps();

  for (const jv of jobVectors) {
    const { score, explanation } = computeJobFitScore(userVector, jv);

    const reason = buildJobReasonFromExplanation(
      explanation,
      score,
      skillMap,
      tagMap,
    );

    results.push({
      user_id: uid,
      job_id: jv.job_id,
      fit_score: score,
      reason,
    });
  }

  // Upsert vào bảng job_recommendations
  const stored = await Promise.all(
    results.map((r) =>
      prisma.jobRecommendation.upsert({
        where: {
          user_id_job_id: {
            user_id: r.user_id,
            job_id: r.job_id,
          },
        },
        create: {
          user_id: r.user_id,
          job_id: r.job_id,
          fit_score: r.fit_score,
          reason: r.reason,
          status: "pending",
        },
        update: {
          fit_score: r.fit_score,
          reason: r.reason,
        },
      }),
    ),
  );

  return stored;
}

function buildCandidateReasonFromExplanation(expl, score, skillMap, tagMap) {
  const lines = [];

  lines.push(formatOverall(score, expl.overall), "", "Kỹ năng:");

  const missingMustSkills = mapNames(skillMap, expl.skills.missingMust);

  if (expl.skills.matchedMustCount > 0) {
    lines.push(
      `- Đáp ứng ${expl.skills.matchedMustCount}/${expl.skills.mustCount} kỹ năng bắt buộc`,
    );
  }

  if (missingMustSkills.length > 0) {
    lines.push(`- Thiếu kỹ năng bắt buộc: ${missingMustSkills.join(", ")}`);
  }

  lines.push("", "Lĩnh vực:");

  if (!expl.tags.hasData) {
    lines.push("- Chưa đủ dữ liệu lĩnh vực để đánh giá");
  } else if (expl.tags.matched.length > 0) {
    lines.push(
      `- Phù hợp với lĩnh vực: ${mapNames(tagMap, expl.tags.matched).join(
        ", ",
      )}`,
    );
  } else {
    lines.push("- Chưa trùng lĩnh vực ưu tiên");
  }

  lines.push("", "Gợi ý:");

  if (expl.overall === "high") {
    lines.push("- Ứng viên phù hợp, nên ưu tiên xem xét phỏng vấn.");
  } else if (missingMustSkills.length > 0) {
    lines.push(
      `- Ứng viên cần bổ sung kỹ năng ${missingMustSkills.join(
        ", ",
      )} trước khi phù hợp hơn.`,
    );
  } else {
    lines.push("- Có thể cân nhắc đào tạo bổ sung hoặc phỏng vấn vòng lọc.");
  }

  return lines.join("\n");
}

/**
 * Sinh gợi ý ỨNG VIÊN cho RECRUITER → ghi vào bảng candidate_recommendations
 */
async function generateCandidateRecommendations(recruiterId) {
  const rid = BigInt(recruiterId);

  // 1. Check role recruiter
  const recruiter = await prisma.user.findUnique({
    where: { id: rid },
    select: { role: true },
  });

  if (!recruiter) {
    throw new Error("Recruiter không tồn tại");
  }

  if (recruiter.role !== "recruiter" && recruiter.role !== "admin") {
    throw new Error("Chỉ recruiter hoặc admin mới được đề xuất ứng viên");
  }

  // 2. Lấy recruiter vector
  const recruiterVector = await prisma.recruiterVector.findUnique({
    where: { user_id: rid },
  });

  if (!recruiterVector) {
    throw new Error("Recruiter vector không tồn tại");
  }

  // 3. Lấy toàn bộ ứng viên có userVector (loại chính recruiter ra)
  const applicants = await prisma.userVector.findMany({
    where: {
      user_id: { not: rid },
      user: {
        is: {
          OR: [{ role: "applicant" }, { role: "admin" }],
        },
      },
    },
    include: { user: true },
  });

  if (applicants.length === 0) {
    throw new Error("Không có ứng viên nào để đề xuất");
  }

  const results = [];

  const { skillMap, tagMap } = await buildLookupMaps();

  for (const appVector of applicants) {
    const { score, explanation } = computeCandidateFitScore(
      appVector,
      recruiterVector,
    );

    const reason = buildCandidateReasonFromExplanation(
      explanation,
      score,
      skillMap,
      tagMap,
    );

    results.push({
      recruiter_id: rid,
      applicant_id: appVector.user_id,
      fit_score: score,
      reason,
    });
  }

  // 4. Upsert CandidateRecommendation
  const stored = await Promise.all(
    results.map((r) =>
      prisma.candidateRecommendation.upsert({
        where: {
          recruiter_id_applicant_id: {
            recruiter_id: r.recruiter_id,
            applicant_id: r.applicant_id,
          },
        },
        create: {
          ...r,
          status: "pending",
        },
        update: {
          fit_score: r.fit_score,
          reason: r.reason,
        },
      }),
    ),
  );

  return stored;
}

// Lấy danh sách job được recommend cho user
async function getRecommendedJobsForUser(
  userId,
  { min_score = 0, location, tags = [], page = 1, limit = 10 },
) {
  const uid = BigInt(userId);
  const skip = (page - 1) * limit;

  // WHERE cho job_recommendation
  const where = {
    user_id: uid,
    fit_score: { gte: Number(min_score) },
  };

  // Build filter bên trong job
  const jobFilter = {};

  if (location?.trim()) {
    jobFilter.location = { contains: location.trim() };
  }

  if (Array.isArray(tags) && tags.length > 0) {
    jobFilter.tags = {
      some: {
        tag: { name: { in: tags } },
      },
    };
  }

  if (Object.keys(jobFilter).length > 0) {
    where.job = jobFilter;
  }

  // Query DB
  const [rows, total] = await Promise.all([
    prisma.jobRecommendation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fit_score: "desc" },
      include: {
        job: {
          include: {
            company: { select: { id: true, legal_name: true, logo: true } },
            approval: true,
            tags: { include: { tag: true } },
            requiredSkills: { include: { skill: true } },
            vector: true,
          },
        },
      },
    }),

    prisma.jobRecommendation.count({ where }),
  ]);

  // FAVORITE của userId
  let favoriteIds = new Set();
  const favorites = await prisma.userFavoriteJobs.findMany({
    where: { user_id: uid },
    select: { job_id: true },
  });

  favoriteIds = new Set(favorites.map((f) => Number(f.job_id)));

  // Gắn isFavorite
  const items = rows.map((rec) => ({
    ...rec,
    job: {
      ...rec.job,
      isFavorite: favoriteIds.has(Number(rec.job.id)),
    },
  }));

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

async function getRecommendedCandidatesForRecruiter(
  recruiterId,
  { min_score = 0, location, tags = [], page = 1, limit = 10 },
) {
  const rid = BigInt(recruiterId);
  const skip = (page - 1) * limit;

  const where = {
    recruiter_id: rid,
    fit_score: { gte: Number(min_score) },
  };

  // Filter theo location ứng viên
  if (location && location.trim() !== "") {
    where.applicant = {
      is: {
        preferred_location: { contains: location.trim() },
      },
    };
  }

  // Filter theo tag kỹ năng/lĩnh vực của ứng viên
  if (Array.isArray(tags) && tags.length > 0) {
    where.applicant = {
      ...(where.applicant?.is ? { is: where.applicant.is } : {}),
      tags: {
        some: { tag: { name: { in: tags } } },
      },
    };
  }

  const [rows, total] = await Promise.all([
    prisma.candidateRecommendation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fit_score: "desc" },
      include: {
        applicant: {
          include: {
            careerPreference: true,
            vector: true,
          },
        },
        recruiter: true,
      },
    }),
    prisma.candidateRecommendation.count({ where }),
  ]);

  return {
    items: rows,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = {
  generateRecommendationsForUser,
  generateCandidateRecommendations,
  getRecommendedJobsForUser,
  getRecommendedCandidatesForRecruiter,
};
