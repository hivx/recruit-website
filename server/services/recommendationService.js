const { computeJobFitScore } = require("../utils/fitScore");
const prisma = require("../utils/prisma");

function countMatchingTags(userVector, jobVector) {
  const uTags = userVector?.tag_profile;
  const jTags = jobVector?.tag_profile;

  if (!uTags?.length || !jTags?.length) {
    return 0;
  }

  // Dùng Set để check nhanh
  const userTagSet = new Set(uTags.map((t) => t.id));

  let count = 0;

  for (const jt of jTags) {
    if (userTagSet.has(jt.id)) {
      count++;
    }
  }

  return count;
}

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

async function generateRecommendationsForUser(userId) {
  const uid = BigInt(userId);

  const userVector = await prisma.userVector.findUnique({
    where: { user_id: uid },
  });

  if (!userVector) {
    throw new Error("User vector không tồn tại");
  }

  const jobVectors = await prisma.jobVector.findMany({
    include: { job: true },
  });

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

module.exports = {
  generateRecommendationsForUser,
};
