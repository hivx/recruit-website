const recruiterVector = require("../../services/recruiterVectorService");

module.exports = {
  async onRecruiterPreferenceChanged({ userId }) {
    console.log("[EVENT] RECRUITER_PREF_CHANGED", userId);

    await recruiterVector.buildRecruiterVector(userId);
  },
};
