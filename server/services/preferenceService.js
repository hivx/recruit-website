// server/services/preferenceService.js
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
  if (!payload) {
    payload = {};
  }
  const {
    desired_location,
    desired_salary_avg,
    desired_tags = [],
    required_skills = [],
  } = payload;

  // upsert core
  await prisma.recruiterPreference.upsert({
    where: { user_id: BigInt(userId) },
    update: {
      desired_location: desired_location ?? null,
      desired_salary_avg: desired_salary_avg ?? null,
      updated_at: new Date(),
    },
    create: {
      user_id: BigInt(userId),
      desired_location: desired_location ?? null,
      desired_salary_avg: desired_salary_avg ?? null,
    },
  });

  // tags
  const tagNames = [
    ...new Set(
      desired_tags
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  if (tagNames.length) {
    await Promise.all(
      tagNames.map((name) =>
        prisma.tag.upsert({ where: { name }, update: {}, create: { name } }),
      ),
    );
    const tagRows = await prisma.tag.findMany({
      where: { name: { in: tagNames } },
    });
    await prisma.recruiterPreferenceTag.deleteMany({
      where: { user_id: BigInt(userId) },
    });
    await prisma.recruiterPreferenceTag.createMany({
      data: tagRows.map((t) => ({ user_id: BigInt(userId), tag_id: t.id })),
      skipDuplicates: true,
    });
  }

  // required skills
  if (Array.isArray(required_skills)) {
    // mỗi item: { name, years_required?, must_have? }
    const skillNames = [
      ...new Set(
        required_skills.map((s) => String(s.name || "").trim()).filter(Boolean),
      ),
    ];
    await Promise.all(
      skillNames.map((name) =>
        prisma.skill.upsert({ where: { name }, update: {}, create: { name } }),
      ),
    );
    const skillRows = await prisma.skill.findMany({
      where: { name: { in: skillNames } },
    });

    await prisma.recruiterRequiredSkill.deleteMany({
      where: { user_id: BigInt(userId) },
    });
    await prisma.recruiterRequiredSkill.createMany({
      data: required_skills.map((s) => {
        const skill = skillRows.find((r) => r.name === s.name);
        return {
          user_id: BigInt(userId),
          skill_id: skill.id,
          years_required: s.years_required ?? null,
          must_have: s.must_have !== false, // mặc định true
        };
      }),
      skipDuplicates: true,
    });
  }

  return this.getRecruiterPreference(userId);
};
