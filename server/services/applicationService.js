// services/applicationService.js
const { logUserInterest } = require("../middleware/logUserInterest");
const prisma = require("../utils/prisma");
// Giữ nguyên đường dẫn import DTO đúng theo cây của bạn
const { toApplicationDTO } = require("../utils/serializers/application");

/**
 * Gợi ý: dùng 1 helper nhỏ để map list -> DTO
 */
const mapDTO = (rows) => rows.map(toApplicationDTO);

module.exports = {
  /**
   * Validate trước khi ứng tuyển
   * - phone (nếu có) phải hợp lệ
   * - coverLetter là bắt buộc (schema Application: cover_letter NOT NULL)
   * - job phải tồn tại (đã check approved ở middleware, nhưng vẫn an toàn nếu middleware bị bỏ quên)
   * - chưa ứng tuyển trùng
   */
  async validateApply({ jobId, userId, phone, coverLetter }) {
    // Kiểm tra số điện thoại (tuỳ business; giữ regex hiện tại)
    if (phone && !/^0\d{9}$/.test(phone)) {
      const error = new Error("Số điện thoại không hợp lệ!");
      error.statusCode = 400;
      throw error;
    }

    // Bắt buộc có cover letter theo schema
    if (
      !coverLetter ||
      typeof coverLetter !== "string" ||
      !coverLetter.trim()
    ) {
      const error = new Error("Thiếu coverLetter!");
      error.statusCode = 400;
      throw error;
    }

    // Job có tồn tại không
    const job = await prisma.job.findUnique({
      where: { id: BigInt(jobId) },
      include: { approval: true }, // để an toàn nếu middleware không chạy
    });
    if (!job) {
      const error = new Error("Không tìm thấy công việc với ID đã cung cấp!");
      error.statusCode = 404;
      throw error;
    }

    // (Tuỳ chọn) chặn apply nếu job chưa approved – phòng trường hợp middleware bị skip
    if (job.approval?.status !== "approved") {
      const error = new Error("Job chưa được duyệt!");
      error.statusCode = 403;
      throw error;
    }

    // Kiểm tra đã ứng tuyển chưa
    const existing = await prisma.application.findFirst({
      where: {
        job_id: BigInt(jobId),
        applicant_id: BigInt(userId),
      },
      select: { id: true },
    });
    if (existing) {
      const error = new Error("Bạn đã ứng tuyển công việc này rồi!");
      error.statusCode = 400;
      throw error;
    }

    return true;
  },

  /**
   * Tạo đơn ứng tuyển
   * - Trả về Application đã được DTO hoá
   */
  async createApplication({ userId, jobId, coverLetter, cv, phone }) {
    const application = await prisma.application.create({
      data: {
        job_id: BigInt(jobId),
        applicant_id: BigInt(userId),
        cover_letter: coverLetter, // NOT NULL theo schema
        cv: cv || null, // optional
        phone: phone || null, // optional
        // status / fit_score để Prisma tự set theo default của schema (nếu có)
      },
    });

    // Ghi log hành vi ứng tuyển (không block luồng chính nếu thất bại)
    try {
      const job = await prisma.job.findUnique({
        where: { id: BigInt(jobId) },
        include: { tags: { include: { tag: true } } },
      });
      if (job) {
        logUserInterest({
          userId,
          job,
          source: "applied",
          eventType: cv ? "apply_with_cv" : "apply",
        });
      }
    } catch (e) {
      // chỉ log; không throw để tránh làm hỏng flow apply
      console.warn("[logUserInterest] failed:", e?.message || e);
    }
    // Tăng application_count trên Job (chưa có giảm đi nếu có xoá ứng tuyển)
    await prisma.job.update({
      where: { id: BigInt(jobId) },
      data: { application_count: { increment: 1 } },
    });

    return toApplicationDTO(application);
  },

  /**
   * Lấy danh sách đơn ứng tuyển của 1 user
   * - include job để DTO có { job: {id,title} }
   * - Trả mảng DTO
   */
  async getApplicationsByUser(userId) {
    const rows = await prisma.application.findMany({
      where: { applicant_id: BigInt(userId) },
      include: { job: true },
      orderBy: { created_at: "desc" },
    });
    return mapDTO(rows);
  },

  /**
   * Lấy danh sách ứng viên của 1 job
   * - include applicant để DTO có { applicant: {...} }
   * - Trả mảng DTO
   * - (Lưu ý quyền xem nên kiểm ở controller/middleware)
   */
  async getApplicationsByJob(jobId) {
    const rows = await prisma.application.findMany({
      where: { job_id: BigInt(jobId) },
      include: { applicant: true },
      orderBy: { created_at: "desc" },
    });
    return mapDTO(rows);
  },
};
