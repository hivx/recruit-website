const jobVectorService = require("../../services/jobVectorService");

module.exports = {
  async onJobChanged({ jobId }) {
    console.log("[EVENT] JOB_CHANGED", jobId);

    const vector = await jobVectorService.buildJobVector(jobId);
    console.log("[JOB VECTOR REBUILT]", vector);
  },
};
