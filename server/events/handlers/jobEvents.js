// server/events/handlers/jobEvents
const jobVectorService = require("../../services/jobVectorService");

module.exports = {
  async onJobChanged({ jobId }) {
    console.log("[EVENT] JOB_CHANGED", jobId);

    await jobVectorService.buildJobVector(jobId);
  },
};
