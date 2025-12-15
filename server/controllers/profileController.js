// server/controllers/profileController.js
const builder = require("../services/profileBuilderService");
const { normalizeBigInt } = require("../utils/bigInt");
const prisma = require("../utils/prisma");

// GET /api/users/behavior-profile
exports.getMyProfile = async (req, res) => {
  const prof = await prisma.userBehaviorProfile.findUnique({
    where: { user_id: BigInt(req.user.userId) },
  });
  res.json(normalizeBigInt(prof || {}));
};

// POST /api/users/behavior-profile/rebuild
exports.rebuildMyProfile = async (req, res) => {
  const result = await builder.rebuildForUser(req.user.userId);
  res.json({ message: "rebuilt", result: normalizeBigInt(result) });
};
