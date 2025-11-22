// server/services/preferenceService.js
const { emitEvent } = require("../events");
const prisma = require("../utils/prisma");

exports.getCareerPreference = async (userId) => {
  const pref = await prisma.careerPreference.findUnique({
    where: { user_id: BigInt(userId) },
    include: {
      tags: { include: { tag: true } },
    },
  });
  if (!pref) {
    return null;
  }
  return {
    user_id: pref.user_id.toString(),
    desired_title: pref.desired_title,
    desired_company: pref.desired_company,
    desired_location: pref.desired_location,
    desired_salary: pref.desired_salary,
    tags: pref.tags.map((t) => ({ id: t.tag_id, name: t.tag.name })),
    updated_at: pref.updated_at,
    created_at: pref.created_at,
  };
};

exports.upsertCareerPreference = async (userId, payload) => {
  const {
    desired_title,
    desired_company,
    desired_location,
    desired_salary,
    tags = [],
  } = payload || {};

  const uniqueTags = [
    ...new Set(
      tags
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];

  // upsert core
  const pref = await prisma.careerPreference.upsert({
    where: { user_id: BigInt(userId) },
    update: {
      desired_title,
      desired_company,
      desired_location,
      desired_salary,
      updated_at: new Date(),
    },
    create: {
      user_id: BigInt(userId),
      desired_title: desired_title ?? null,
      desired_company: desired_company ?? null,
      desired_location: desired_location ?? null,
      desired_salary: desired_salary ?? null,
    },
  });

  // cập nhật tags nếu có
  if (uniqueTags.length) {
    // tạo hết tags nếu chưa có
    await Promise.all(
      uniqueTags.map((name) =>
        prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );

    const tagRows = await prisma.tag.findMany({
      where: { name: { in: uniqueTags } },
    });

    // sửa ở đây: userId -> user_id
    await prisma.careerPreferenceTag.deleteMany({
      where: { user_id: pref.user_id },
    });

    await prisma.careerPreferenceTag.createMany({
      data: tagRows.map((t) => ({
        user_id: pref.user_id,
        tag_id: t.id,
      })),
      skipDuplicates: true,
    });
  }
  emitEvent("USER_BEHAVIOR_CHANGED", { userId });

  return this.getCareerPreference(userId);
};

exports.getRecruiterPreference = async (userId) => {
  const pref = await prisma.recruiterPreference.findUnique({
    where: { user_id: BigInt(userId) },
    include: {
      desiredTags: { include: { tag: true } },
      requiredSkills: { include: { skill: true } },
    },
  });
  if (!pref) {
    return null;
  }
  return {
    user_id: pref.user_id.toString(),
    desired_location: pref.desired_location,
    desired_salary_avg: pref.desired_salary_avg,
    desired_tags: pref.desiredTags.map((t) => ({
      id: t.tag_id,
      name: t.tag.name,
    })),
    required_skills: pref.requiredSkills.map((rs) => ({
      id: rs.skill_id,
      name: rs.skill.name,
      years_required: rs.years_required,
      must_have: rs.must_have,
    })),
    updated_at: pref.updated_at,
  };
};

exports.upsertRecruiterPreference = async (userId, payload = {}) => {
  const uid = BigInt(userId);

  const shouldUpdate = (v) =>
    !(
      v === undefined ||
      v === null ||
      (typeof v === "string" && v.trim() === "")
    );

  const {
    desired_location,
    desired_salary_avg,
    desired_tags,
    required_skills,
  } = payload;

  // ========= 1. UPDATE CORE FIELDS (nhẹ & đúng chuẩn) =========
  const updateCore = {};
  if (shouldUpdate(desired_location)) {
    updateCore.desired_location = desired_location;
  }
  if (shouldUpdate(desired_salary_avg)) {
    updateCore.desired_salary_avg = desired_salary_avg;
  }
  updateCore.updated_at = new Date();

  await prisma.recruiterPreference.upsert({
    where: { user_id: uid },
    update: updateCore,
    create: {
      user_id: uid,
      desired_location: desired_location ?? null,
      desired_salary_avg: desired_salary_avg ?? null,
    },
  });

  // Helper nhỏ để giảm complexity
  const replaceList = async (list, deleteFn, insertFn) => {
    await deleteFn();
    if (list.length > 0) {
      await insertFn();
    }
  };

  // ========= 2. TAGS (many-to-many) =========
  if (desired_tags !== undefined) {
    if (Array.isArray(desired_tags)) {
      const tagNames = [
        ...new Set(desired_tags.map((t) => String(t).trim()).filter(Boolean)),
      ];

      await replaceList(
        tagNames,
        () =>
          prisma.recruiterPreferenceTag.deleteMany({ where: { user_id: uid } }),
        async () => {
          await Promise.all(
            tagNames.map((name) =>
              prisma.tag.upsert({
                where: { name },
                update: {},
                create: { name },
              }),
            ),
          );
          const tagRows = await prisma.tag.findMany({
            where: { name: { in: tagNames } },
          });
          await prisma.recruiterPreferenceTag.createMany({
            data: tagRows.map((t) => ({ user_id: uid, tag_id: t.id })),
          });
        },
      );
    }
  }

  // ========= 3. REQUIRED SKILLS (many-to-many-with-fields) =========
  if (required_skills !== undefined) {
    if (Array.isArray(required_skills)) {
      await replaceList(
        required_skills,
        () =>
          prisma.recruiterRequiredSkill.deleteMany({ where: { user_id: uid } }),
        async () => {
          const skillNames = [
            ...new Set(
              required_skills
                .map((s) => String(s.name || "").trim())
                .filter(Boolean),
            ),
          ];

          await Promise.all(
            skillNames.map((name) =>
              prisma.skill.upsert({
                where: { name },
                update: {},
                create: { name },
              }),
            ),
          );

          const skillRows = await prisma.skill.findMany({
            where: { name: { in: skillNames } },
          });

          await prisma.recruiterRequiredSkill.createMany({
            data: required_skills.map((s) => ({
              user_id: uid,
              skill_id: skillRows.find((r) => r.name === s.name).id,
              years_required: s.years_required ?? null,
              must_have: s.must_have !== false,
            })),
          });
        },
      );
    }
  }

  // ========= EVENT =========
  emitEvent("RECRUITER_PREF_CHANGED", { userId: uid });

  return this.getRecruiterPreference(userId);
};
