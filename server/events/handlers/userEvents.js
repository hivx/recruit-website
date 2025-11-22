const profileBuilder = require("../../services/profileBuilderService");
const userVector = require("../../services/userVectorService");

module.exports = {
  async onUserBehaviorChanged({ userId }) {
    console.log("[EVENT] USER_BEHAVIOR_CHANGED", userId);

    await profileBuilder.rebuildForUser(userId);
    await userVector.buildUserVector(userId);
  },

  async onUserSkillChanged({ userId }) {
    console.log("[EVENT] USER_SKILL_CHANGED", userId);

    await userVector.buildUserVector(userId);
  },
};
