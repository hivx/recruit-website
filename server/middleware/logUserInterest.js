// middleware/logUserInterest.js
const { emitEvent } = require("../events");
const prisma = require("../utils/prisma");

async function logUserInterest({ userId, job, source, eventType = null }) {
  try {
    if (!userId || !job?.id) {
      return;
    }

    const jobId = BigInt(job.id);

    // ====== Chuẩn hóa dữ liệu lương trung bình ======
    const avgSalary =
      job.salary_min && job.salary_max
        ? Math.round((job.salary_min + job.salary_max) / 2)
        : job.salary_min || job.salary_max || null;

    // ====== Lấy danh sách tag ======
    const tagNames = Array.isArray(job.tags)
      ? job.tags.map((t) => t.tag?.name || t.name).filter(Boolean)
      : [];

    // ====== Lấy danh sách kỹ năng (nếu job có requiredSkills) ======
    // const skillNames = Array.isArray(job.requiredSkills)
    //   ? job.requiredSkills
    //       .map((r) => r.skill?.name || r.skill_name)
    //       .filter(Boolean)
    //   : [];

    // ====== Đọc thời gian chống ghi log trùng ======
    const windowMin = Number.parseInt(
      process.env.LOG_DUPLICATE_WINDOW_MINUTES || "15",
      10,
    );

    // ====== Kiểm tra hành vi trùng trong khung thời gian ======
    const recent = await prisma.userInterestHistory.findFirst({
      where: {
        user_id: BigInt(userId),
        job_id: jobId,
        source, // viewed | applied | favorite | recommended
        event_type: eventType,
        recorded_at: {
          gte: new Date(Date.now() - windowMin * 60 * 1000),
        },
      },
      orderBy: { recorded_at: "desc" },
    });
    if (recent) {
      return;
    }

    // ====== Ghi log hành vi ======
    await prisma.userInterestHistory.create({
      data: {
        user_id: BigInt(userId),
        job_id: jobId,
        job_title: job.title,
        location: job.location ?? null, // thêm location vào
        avg_salary: avgSalary,
        tags: tagNames, // mảng tên tag
        source,
        event_type: eventType,
      },
    });
  } catch (err) {
    console.error("[UserInterestHistory] Ghi log thất bại:", err.message);
  }
  emitEvent("USER_BEHAVIOR_CHANGED", { userId });
}

module.exports = { logUserInterest };
