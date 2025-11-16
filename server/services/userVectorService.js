// services/userVectorService.js
const { normalizeLocation } = require("../utils/locationCodes");
const prisma = require("../utils/prisma");

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

/**
 * Build User Vector chính thức
 */
async function buildUserVector(userId) {
  const uid = BigInt(userId);

  const [userSkills, behavior, preference] = await Promise.all([
    prisma.userSkill.findMany({
      where: { user_id: uid },
      include: { skill: true },
    }),
    prisma.userBehaviorProfile.findUnique({
      where: { user_id: uid },
    }),
    prisma.recruiterPreference.findUnique({
      where: { user_id: uid },
    }),
    prisma.careerPreferenceTag.findMany({
      where: { user_id: uid },
      include: { tag: true },
    }),
  ]);

  /** =============================
   * 1. BUILD SKILL PROFILE
   * ============================= */
  const skill_profile = userSkills.map((s) => ({
    id: s.skill_id,
    w: computeSkillWeight(s.level, s.years),
  }));

  /** =============================
   * 2. BUILD TAG PROFILE
   * ============================= */
  const mergedTags = {};

  // --- 1. Lấy tag từ behaviorProfile (đã chuẩn hóa trọng số) ---
  if (Array.isArray(behavior?.tags)) {
    for (const t of behavior.tags) {
      const name = t?.name?.toLowerCase();
      if (!name) {
        continue;
      }

      mergedTags[name] = Math.max(mergedTags[name] || 0, t.weight || 0);
    }
  }

  // --- Final: convert thành array ---
  const tag_profile = Object.entries(mergedTags).map(([name, weight]) => ({
    name,
    weight: Number(weight.toFixed(4)),
  }));

  /** =============================
   * 3. TITLE KEYWORDS (tạm chưa dùng)
   * ============================= */
  const keywordMap = {};

  if (Array.isArray(behavior?.keywords)) {
    for (const kw of behavior.keywords) {
      const k = kw.name?.toLowerCase();
      if (!k) {
        continue;
      }
      keywordMap[k] = Math.max(keywordMap[k] || 0, kw.weight || 0);
    }
  }

  const title_keywords = Object.entries(keywordMap).map(
    ([keyword, weight]) => ({
      keyword,
      weight: Number(weight.toFixed(4)),
    }),
  );

  /** =============================
   * 4. LOCATION & SALARY
   * ============================= */
  const preferred_location = normalizeLocation(
    preference?.desired_location || behavior?.main_location,
  );

  const salary_expected = computeExpectedSalary(preference, behavior);

  /** =============================
   * 5. LƯU VÀO UserVector
   * ============================= */
  const updated = await prisma.userVector.upsert({
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

  return updated;
}

module.exports = {
  buildUserVector,
};
