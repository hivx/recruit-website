// server/middleware/logUserInterest.js
const prisma = require("../utils/prisma");

/**
 * Ghi log hành vi người dùng (viewed, applied, favorite)
 * @param {object} options
 * @param {number|string} options.userId - ID người dùng (BigInt trong DB)
 * @param {object} options.job - Đối tượng Job (phải có id, title, salary_min/max, tags[])
 * @param {"viewed"|"applied"|"favorite"} options.source - Loại hành vi chính
 * @param {string} [options.eventType] - Hành vi chi tiết (vd: "apply_with_cv")
 */
async function logUserInterest({ userId, job, source, eventType = null }) {
  try {
    if (!userId || !job?.id) {
      console.warn("Bỏ qua logUserInterest vì thiếu userId hoặc jobId");
      return;
    }

    // Tính trung bình lương (nếu có)
    const avgSalary =
      job.salary_min && job.salary_max
        ? Math.round((job.salary_min + job.salary_max) / 2)
        : job.salary_min || job.salary_max || null;

    // Lấy danh sách tên tag (nếu có)
    const tags =
      Array.isArray(job.tags) && job.tags.length > 0
        ? job.tags.map((t) => t.tag?.name || t.name).filter(Boolean)
        : [];

    // Ghi log vào DB
    await prisma.userInterestHistory.create({
      data: {
        user_id: BigInt(userId),
        job_id: BigInt(job.id),
        job_title: job.title,
        avg_salary: avgSalary,
        tags: tags.length ? JSON.stringify(tags) : null,
        source,
        event_type: eventType,
      },
    });

    console.log(`[InterestLog] ${source} - user:${userId} job:${job.id}`);
  } catch (err) {
    console.error("Lỗi khi ghi log hành vi:", err.message);
  }
}

module.exports = { logUserInterest };
