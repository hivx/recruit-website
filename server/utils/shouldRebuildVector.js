//server/utils/shouldRebuildVector.js
const cfg = require("../config/profile.config");
const prisma = require("../utils/prisma");

async function shouldRebuildVector(table, idField, entityId) {
  const row = await prisma[table].findUnique({
    where: { [idField]: BigInt(entityId) },
    select: { updated_at: true },
  });

  // chưa có vector → build lần đầu
  if (!row) {
    return true;
  }

  const diffMinutes = (Date.now() - new Date(row.updated_at).getTime()) / 60000;

  return diffMinutes >= cfg.MIN_REBUILD_VECTOR_MINUTES; // 15 phút
}

module.exports = { shouldRebuildVector };
