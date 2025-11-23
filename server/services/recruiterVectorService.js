const { normalizeLocation } = require("../utils/locationCodes");
const prisma = require("../utils/prisma");
const { shouldRebuildVector } = require("../utils/shouldRebuildVector");

/**
 * Convert years_required → weight [0.1 → 1]
 * Giống phong cách normalize của UserVector nhưng đơn giản hơn.
 */
function computeRecruiterSkillWeight(rrs) {
  let weight =
    (rrs.years_required ?? 1) / 10 +
    (0.1 * (10 - (rrs.years_required ?? 1))) / 10;

  if (weight > 1) {
    weight = 1;
  }
  if (weight < 0.1) {
    weight = 0.1;
  }

  return Number(weight.toFixed(4));
}

async function buildRecruiterVector(userId) {
  const uid = BigInt(userId);

  // 1) lấy user trước để kiểm tra role
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2) role check
  if (user.role !== "recruiter" && user.role !== "admin") {
    throw new Error("Người dùng không phải nhà tuyển dụng");
  }

  const canRebuild = await shouldRebuildVector(
    "recruiterVector",
    "user_id",
    userId,
  );

  if (!canRebuild) {
    console.log("[SKIP] Bỏ qua build recruiterVector: ", userId);
    return null;
  }

  const pref = await prisma.recruiterPreference.findUnique({
    where: { user_id: uid },
    include: {
      requiredSkills: true,
      desiredTags: true,
    },
  });

  if (!pref) {
    throw new Error("Không tìm thấy RecruiterPreference cho user này");
  }

  /** =============================
   * 1. SKILL PROFILE
   * ============================= */
  const skill_profile = pref.requiredSkills.map((s) => ({
    id: s.skill_id,
    must: s.must_have,
    weight: computeRecruiterSkillWeight(s),
  }));

  /** =============================
   * 2. TAG PROFILE (giống UserVector)
   * ============================= */
  const tag_profile = pref.desiredTags.map((t) => ({
    id: t.tag_id,
    weight: 1,
  }));

  /** =============================
   * 3. LOCATION (normalize giống UserVector)
   * ============================= */
  const preferred_location = normalizeLocation(pref.desired_location);

  /** =============================
   * 4. SALARY AVG (giống salary_expected bên User)
   * ============================= */
  const salary_avg = pref.desired_salary_avg || null;

  /** =============================
   * 5. LƯU RecruiterVector
   * ============================= */
  const updated = await prisma.recruiterVector.upsert({
    where: { user_id: uid },
    update: {
      skill_profile,
      tag_profile,
      preferred_location,
      salary_avg,
      updated_at: new Date(),
    },
    create: {
      user_id: uid,
      skill_profile,
      tag_profile,
      preferred_location,
      salary_avg,
    },
  });

  return updated;
}

module.exports = {
  buildRecruiterVector,
};
