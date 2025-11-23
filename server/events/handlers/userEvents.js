const profileBuilder = require("../../services/profileBuilderService");
const userVectorService = require("../../services/userVectorService");

module.exports = {
  // Xử lý khi có thay đổi hành vi người dùng, chú ý là hành vi có thể ko rebuild do time decay và vector cũng vậy
  async onUserBehaviorChanged({ userId }) {
    await profileBuilder.rebuildForUser(userId);
    userVectorService.buildUserVector(userId);
  },

  async onUserSkillChanged({ userId }) {
    await userVectorService.buildUserVector(userId);
  },
};
