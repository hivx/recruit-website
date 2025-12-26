// server/events/handlers/recruiterEvents
const recruiterVector = require("../../services/recruiterVectorService");

module.exports = {
  async onRecruiterPreferenceChanged({ userId }) {
    await recruiterVector.buildRecruiterVector(userId);
  },
};
