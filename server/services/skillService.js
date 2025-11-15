// server/services/skillService.js
const prisma = require("../utils/prisma");

exports.listSkills = async (q = "") => {
  const where = q ? { name: { contains: String(q) } } : {};
  return prisma.skill.findMany({ where, orderBy: { name: "asc" } });
};

exports.addOrUpdateUserSkill = async (userId, { name, level, years, note }) => {
  const skill = await prisma.skill.upsert({
    where: { name },
    update: {},
    create: { name },
  });

  const data = {
    user_id: BigInt(userId),
    skill_id: skill.id,
    level: level ?? null,
    years: years ?? null,
    note: note ?? null,
  };

  // upsert bằng delete + create (vì composite PK user_id+skill_id)
  await prisma.userSkill.upsert({
    where: {
      user_id_skill_id: { user_id: data.user_id, skill_id: data.skill_id },
    },
    update: { level: data.level, years: data.years, note: data.note },
    create: data,
  });

  return { message: "Cập nhật kỹ năng thành công!" };
};

exports.removeUserSkill = async (userId, skillId) => {
  await prisma.userSkill.delete({
    where: {
      user_id_skill_id: {
        user_id: BigInt(userId),
        skill_id: Number(skillId),
      },
    },
  });
  return { message: "Đã xoá kỹ năng" };
};

exports.getMySkills = async (userId) => {
  const rows = await prisma.userSkill.findMany({
    where: { user_id: BigInt(userId) },
    include: { skill: true },
    orderBy: { skill_id: "asc" },
  });
  return rows.map((r) => ({
    id: r.skill_id,
    name: r.skill.name,
    level: r.level,
    years: r.years,
    note: r.note,
  }));
};
