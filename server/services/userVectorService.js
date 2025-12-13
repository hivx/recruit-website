// services/userVectorService.js
const { normalizeLocation } = require("../utils/locationCodes");
const prisma = require("../utils/prisma");
const { shouldRebuildVector } = require("../utils/shouldRebuildVector");

/**
 * Map level → max years tương ứng
 */
const MAX_YEARS_BY_LEVEL = {
  1: 1,
  2: 3,
  3: 5,
  4: 7,
  5: 10,
};

/**
 * Tính trọng số skill từ level & years theo công thức bạn yêu cầu:
 * - weight = 0–1
 * - years > maxYears → cộng bonus tối đa 0.2
 */
function computeSkillWeight(level = 1, years = 0) {
  const maxYears = MAX_YEARS_BY_LEVEL[level] || 1;

  const levelScore = level / 5; // trọng số trình độ (0.2 → 1)
  const experienceRatio = Math.min(years / maxYears, 1);

  const bonus = years > maxYears ? Math.min((years - maxYears) * 0.05, 0.2) : 0;

  const weight = 0.8 * levelScore + 0.2 * (experienceRatio + bonus);
  return Number(Math.min(weight, 1).toFixed(4));
}

/**
 * Tính salary_expected từ BehaviorProfile
 * Ưu tiên:  BehaviorProfile.avg_salary - CareerPreference.desired_salary - fallback null
 */
function computeExpectedSalary(preference, behavior) {
  if (behavior?.avg_salary) {
    return behavior.avg_salary;
  }
  if (preference?.desired_salary) {
    return preference.desired_salary;
  }
  return null;
}

async function validateApplicant(uid) {
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { role: true },
  });

  if (!user) {
    console.warn("[UserVector] User không tồn tại:", uid.toString());
    return false;
  }

  if (user.role !== "applicant" && user.role !== "admin") {
    console.warn("[UserVector] Skip non-applicant:", user.role, uid.toString());
    return false;
  }

  return true;
}

/**
 * Build User Vector chính thức
 */
async function buildUserVector(userId) {
  const uid = BigInt(userId);

  const isValid = await validateApplicant(uid);
  if (!isValid) {
    return null; // không throw
  }

  const canRebuild = await shouldRebuildVector(
    "userVector", // bảng user_vector
    "user_id", // field id
    userId,
  );

  if (!canRebuild) {
    console.log("[SKIP] Bỏ qua build userVector: ", userId);
    return null;
  }

  const [userSkills, behavior, preference] = await Promise.all([
    prisma.userSkill.findMany({
      where: { user_id: uid },
      include: { skill: true },
    }),
    prisma.userBehaviorProfile.findUnique({
      where: { user_id: uid },
    }),
    prisma.careerPreference.findUnique({
      where: { user_id: uid },
    }),
  ]);

  const skill_profile = buildSkillProfile(userSkills);
  const mergedTags = mergeBehaviorTags(behavior);
  const tag_profile = await mapTagsToDB(mergedTags);
  const title_keywords = buildKeywordProfile(behavior);
  const { preferred_location, salary_expected } = resolveLocationAndSalary(
    preference,
    behavior,
  );

  return prisma.userVector.upsert({
    where: { user_id: uid },
    update: {
      skill_profile,
      tag_profile,
      title_keywords,
      preferred_location,
      salary_expected,
      updated_at: new Date(),
    },
    create: {
      user_id: uid,
      skill_profile,
      tag_profile,
      title_keywords,
      preferred_location,
      salary_expected,
    },
  });
}

/* ===============================
    HELPERS
=============================== */

function buildSkillProfile(userSkills) {
  return userSkills.map((s) => ({
    id: s.skill_id,
    w: computeSkillWeight(s.level, s.years),
  }));
}

function mergeBehaviorTags(behavior) {
  const merged = {};
  if (Array.isArray(behavior?.tags)) {
    for (const t of behavior.tags) {
      const name = typeof t?.name === "string" ? t.name : null;
      if (!name) {
        continue;
      }
      merged[name] = Math.max(merged[name] || 0, t.weight || 0);
    }
  }
  return merged;
}

async function mapTagsToDB(mergedTags) {
  const tagNames = Object.keys(mergedTags);
  if (!tagNames.length) {
    return [];
  }

  const dbTags = await prisma.tag.findMany({
    where: { name: { in: tagNames } },
    select: { id: true, name: true },
  });

  return dbTags.map((t) => ({
    id: t.id,
    weight: Number((mergedTags[t.name] ?? 0).toFixed(4)),
  }));
}

function buildKeywordProfile(behavior) {
  const keywordMap = {};

  if (Array.isArray(behavior?.keywords)) {
    for (const kw of behavior.keywords) {
      const k = typeof kw.name === "string" ? kw.name.toLowerCase() : null;
      if (!k) {
        continue;
      }
      keywordMap[k] = Math.max(keywordMap[k] || 0, kw.weight || 0);
    }
  }

  return Object.entries(keywordMap).map(([keyword, weight]) => ({
    keyword,
    weight: Number(weight.toFixed(4)),
  }));
}

function resolveLocationAndSalary(preference, behavior) {
  return {
    preferred_location: normalizeLocation(
      preference?.desired_location || behavior?.main_location,
    ),
    salary_expected: computeExpectedSalary(preference, behavior),
  };
}

module.exports = {
  buildUserVector,
};
