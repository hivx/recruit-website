// server/services/jobVectorService.js
const { normalizeLocation } = require("../utils/locationCodes");
const prisma = require("../utils/prisma");
const { shouldRebuildVector } = require("../utils/shouldRebuildVector");

const MAX_YEARS_BY_LEVEL = { 1: 1, 2: 3, 3: 5, 4: 7, 5: 10 };

function computeJobSkillWeight(level = 1, years = 0, fitWeight = 1) {
  const maxYears = MAX_YEARS_BY_LEVEL[level] || 1;

  const levelScore = level / 5;
  const experienceRatio = Math.min(years / maxYears, 1);
  const bonus = years > maxYears ? Math.min((years - maxYears) * 0.05, 0.2) : 0;

  const base = 0.7 * levelScore + 0.3 * (experienceRatio + bonus);

  return Number(Math.min(base * fitWeight, 1).toFixed(4));
}

async function buildJobVector(jobId) {
  const canRebuild = await shouldRebuildVector("jobVector", "job_id", jobId);

  if (!canRebuild) {
    return null;
  }
  const job = await prisma.job.findUnique({
    where: { id: BigInt(jobId) },
    include: {
      tags: { include: { tag: true } },
      requiredSkills: { include: { skill: true } },
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  /** ============================
   * 1. Skill profile
   * ============================ */
  const skill_profile = job.requiredSkills.map((rs) => ({
    id: rs.skill_id,
    weight: computeJobSkillWeight(
      rs.level_required,
      rs.years_required,
      rs.fit_weight,
    ),
    must: rs.must_have,
  }));

  /** ============================
   * 2. Tag profile
   * ============================ */
  const tag_profile = job.tags.map((jt) => ({
    id: jt.tag_id,
    weight: 1,
  }));

  /** ============================
   * 3. Lương trung bình
   * ============================ */
  let salary_avg = null;
  if (job.salary_min && job.salary_max) {
    salary_avg = Math.round((job.salary_min + job.salary_max) / 2);
  } else {
    salary_avg = job.salary_min || job.salary_max || null;
  }

  /** ============================
   * 4. Location
   * ============================ */
  const location = normalizeLocation(job.location);

  /** ============================
   * 5. Upsert vào JobVector
   * ============================ */
  const saved = await prisma.jobVector.upsert({
    where: { job_id: job.id },
    update: {
      skill_profile,
      tag_profile,
      title_keywords: null,
      salary_avg,
      location,
    },
    create: {
      job_id: job.id,
      skill_profile,
      tag_profile,
      title_keywords: null,
      salary_avg,
      location,
    },
  });

  return saved;
}

module.exports = { buildJobVector };
