const {
  countMatchingTags,
  computeJobFitScore,
  computeCandidateFitScore,
} = require("../utils/fitScore");
const prisma = require("../utils/prisma");

/**
 * Build lý do recommend JOB cho USER
 */
function buildReason(userVector, jobVector, score) {
  const reasons = [];

  if (score >= 0.7) {
    reasons.push("Mức độ phù hợp cao");
  } else if (score >= 0.5) {
    reasons.push("Phù hợp tương đối");
  } else {
    reasons.push("Chưa phù hợp lắm");
  }

  if (userVector.preferred_location === jobVector.location) {
    reasons.push("Đúng khu vực mong muốn");
  }

  const matchCount = countMatchingTags(userVector, jobVector);

  if (matchCount >= 2) {
    reasons.push("Phù hợp nhiều nhóm ngành/lĩnh vực");
  } else if (matchCount === 1) {
    reasons.push("Phù hợp một số nhóm ngành/lĩnh vực");
  }

  return reasons.join(", ");
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
    where: {
      job: {
        approval: {
          status: "approved",
        },
      },
    },
  });

  if (jobVectors.length === 0) {
    throw new Error("Không có job vector nào để đề xuất");
  }

  const results = [];

  for (const jv of jobVectors) {
    const fit = computeJobFitScore(userVector, jv);
    const reason = buildReason(userVector, jv, fit);

    results.push({
      user_id: uid,
      job_id: jv.job_id,
      fit_score: fit,
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

/**
 * Build lý do recommend CANDIDATE cho RECRUITER
 */
function buildCandidateReason(appVector, recruiterVector, score) {
  const reasons = [];

  if (score >= 0.7) {
    reasons.push("Kỹ năng và lĩnh vực phù hợp cao");
  } else if (score >= 0.5) {
    reasons.push("Phù hợp tương đối");
  } else {
    reasons.push("Có mức độ phù hợp ban đầu");
  }

  const tagMatch = countMatchingTags(appVector, recruiterVector);
  if (tagMatch >= 2) {
    reasons.push("Trùng nhiều nhóm ngành");
  } else if (tagMatch === 1) {
    reasons.push("Trùng một phần nhóm ngành");
  }

  if (appVector.preferred_location === recruiterVector.preferred_location) {
    reasons.push("Ưu tiên địa điểm trùng khớp");
  }

  return reasons.join(", ");
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

  for (const appVector of applicants) {
    const fit = computeCandidateFitScore(appVector, recruiterVector);
    const reason = buildCandidateReason(appVector, recruiterVector, fit);

    results.push({
      recruiter_id: rid,
      applicant_id: appVector.user_id,
      fit_score: fit,
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
            user: true,
            tags: { include: { tag: true } },
          },
        },
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
