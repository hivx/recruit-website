// server/utils/cronSchedules.js
const cron = require("node-cron");
const cfg = require("../config/profile.config");

const jobVectorService = require("../services/jobVectorService");
const profileBuilderService = require("../services/profileBuilderService");
const recommendationService = require("../services/recommendationService");
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

// Cron chạy theo config (mặc định 2:00 AM)
cron.schedule(cfg.CRON_SCHEDULE, async () => {
  try {
    // ----------------------------
    // 1) Rebuild UserVector
    // ----------------------------
    const applicants = await prisma.user.findMany({
      where: { OR: [{ role: "applicant" }, { role: "admin" }] },
      select: { id: true },
    });

    for (const u of applicants) {
      try {
        const vec = await userVectorService.buildUserVector(u.id);

        // Auto Recommend nếu bật trong config
        if (cfg.ENABLE_AUTO_RECOMMEND && vec !== null) {
          await recommendationService.generateRecommendationsForUser(u.id);
        }
      } catch (e) {
        console.error("[CRON] User Vector Error:", u.id, e.message);
      }
    }

    // ----------------------------
    // 2) Rebuild RecruiterVector
    // ----------------------------
    const recruiters = await prisma.user.findMany({
      where: { OR: [{ role: "recruiter" }, { role: "admin" }] },
      select: { id: true },
    });

    for (const r of recruiters) {
      try {
        const vec = await recruiterVectorService.buildRecruiterVector(r.id);

        if (cfg.ENABLE_AUTO_RECOMMEND && vec !== null) {
          await recommendationService.generateCandidateRecommendations(r.id);
        }
      } catch (e) {
        console.error("[CRON] Recruiter Vector Error:", r.id, e.message);
      }
    }

    console.log("[CRON] Đã Recommend");
  } catch (err) {
    console.error("[CRON] ERROR:", err);
  }
});

console.log(`[CRON] Đã khởi chạy cron rebuild vector`);
