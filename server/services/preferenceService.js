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
    tags: pref.tags.map((t) => ({ id: t.tagId, name: t.tag.name })),
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

  // chuẩn hoá tag names -> upsert Tag rồi gắn bảng nối
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
      desired_salary: desired_salary ?? null,
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
        prisma.tag.upsert({ where: { name }, update: {}, create: { name } }),
      ),
    );

    const tagRows = await prisma.tag.findMany({
      where: { name: { in: uniqueTags } },
    });

    await prisma.careerPreferenceTag.deleteMany({
      where: { userId: pref.user_id },
    });
    await prisma.careerPreferenceTag.createMany({
      data: tagRows.map((t) => ({ userId: pref.user_id, tagId: t.id })),
      skipDuplicates: true,
    });
  }

  return this.getCareerPreference(userId);
};
