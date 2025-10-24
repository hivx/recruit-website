// middleware/logUserInterest.js
const prisma = require("../utils/prisma");

async function logUserInterest({ userId, job, source, eventType = null }) {
  try {
    if (!userId || !job?.id) {
      return;
    }

    const avgSalary =
      job.salary_min && job.salary_max
        ? Math.round((job.salary_min + job.salary_max) / 2)
        : job.salary_min || job.salary_max || null;

    // Lấy tag names và truyền array (JSON field) — KHÔNG stringify
    const tagNames = Array.isArray(job.tags)
      ? job.tags.map((t) => t.tag?.name || t.name).filter(Boolean)
      : [];

    // Đọc env an toàn + fallback
    const windowMin = Number.parseInt(
      process.env.LOG_DUPLICATE_WINDOW_MINUTES || "15",
      10,
    );
    const recent = await prisma.userInterestHistory.findFirst({
      where: {
        user_id: BigInt(userId),
        job_id: BigInt(job.id),
        source, // 'viewed' | 'applied' | 'favorite' | 'recommended'
        event_type: eventType, // schema cho phép null
        recorded_at: {
          gte: new Date(Date.now() - windowMin * 60 * 1000),
        },
      },
      orderBy: { recorded_at: "desc" },
    });
    if (recent) {
      return;
    }

    await prisma.userInterestHistory.create({
      data: {
        user_id: BigInt(userId),
        job_id: BigInt(job.id),
        job_title: job.title,
        avg_salary: avgSalary,
        tags: tagNames.length ? tagNames : null, // array vào cột Json
        source,
        event_type: eventType,
      },
    });
  } catch (err) {
    console.error("Lỗi khi ghi log hành vi:", err.message);
  }
}

module.exports = { logUserInterest };
