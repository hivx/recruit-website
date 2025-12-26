// server/events/handlers/jobEvents
const jobVectorService = require("../../services/jobVectorService");

module.exports = {
  async onJobChanged({ jobId }) {
    await jobVectorService.buildJobVector(jobId);
  },
};
