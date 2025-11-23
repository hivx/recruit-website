const cron = require("node-cron");
const cfg = require("../config/profile.config");

const jobVectorService = require("../services/jobVectorService");
const profileBuilderService = require("../services/profileBuilderService");
const recruiterVectorService = require("../services/recruiterVectorService");
const userVectorService = require("../services/userVectorService");

const prisma = require("../utils/prisma");

// USER VECTOR
cron.schedule(`*/${cfg.VECTOR_CRON_INTERVAL_MIN} * * * *`, async () => {
  const users = await prisma.user.findMany({ select: { id: true } });

  for (const u of users) {
    await profileBuilderService.rebuildForUser(u.id); // rebuild behavior profile
    userVectorService.buildUserVector(u.id); // rebuild user vector
  }
});

// JOB VECTOR
cron.schedule(`*/${cfg.VECTOR_CRON_INTERVAL_MIN} * * * *`, async () => {
  const jobs = await prisma.job.findMany({ select: { id: true } });

  for (const j of jobs) {
    jobVectorService.buildJobVector(j.id);
  }
});

// RECRUITER VECTOR
cron.schedule(`*/${cfg.VECTOR_CRON_INTERVAL_MIN} * * * *`, async () => {
  // lấy đúng user có recruiter profile
  const recruiters = await prisma.recruiterPreference.findMany({
    select: { user_id: true },
  });

  for (const r of recruiters) {
    recruiterVectorService.buildRecruiterVector(r.user_id);
  }
});

console.log(`[CRON] Đã khởi chạy cron rebuild vector`);
