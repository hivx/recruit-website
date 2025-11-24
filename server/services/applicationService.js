// services/applicationService.js
const { logUserInterest } = require("../middleware/logUserInterest");
const { computeFitScore } = require("../utils/fitScore");
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
    const app = await prisma.application.create({
      data: {
        job_id: BigInt(jobId),
        applicant_id: BigInt(userId),
        cover_letter: coverLetter,
        cv: cv || null,
        phone: phone || null,
      },
    });

    // ============================
    // 1) Log hành vi
    // ============================
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
      console.warn("[logUserInterest] failed:", e?.message || e);
    }

    // ============================
    // 2) Tăng application_count
    // ============================
    await prisma.job.update({
      where: { id: BigInt(jobId) },
      data: { application_count: { increment: 1 } },
    });

    // ============================
    // 3) Tính fit_score
    // ============================
    try {
      const userVector = await prisma.userVector.findUnique({
        where: { user_id: BigInt(userId) },
      });

      const jobVector = await prisma.jobVector.findUnique({
        where: { job_id: BigInt(jobId) },
      });

      if (userVector && jobVector) {
        const fit = computeFitScore(userVector, jobVector);

        await prisma.application.update({
          where: { id: app.id },
          data: { fit_score: fit },
        });

        app.fit_score = fit;
      } else {
        console.warn(
          "[Application] Vector không tồn tại → bỏ qua tính fit_score",
        );
      }
    } catch (err) {
      console.warn("[Application] Lỗi tính fit_score:", err.message);
    }
    return toApplicationDTO(app);
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

  // Đánh giá (review) hồ sơ ứng viên
  async reviewApplication(applicationId, reviewer, reviewData) {
    const reviewerId = BigInt(reviewer.id);
    const isAdmin = reviewer.role === "admin";

    // Lấy application kèm job để kiểm quyền + applicant để trả DTO
    const app = await prisma.application.findUnique({
      where: { id: BigInt(applicationId) },
      include: {
        job: { select: { id: true, title: true, created_by: true } },
        applicant: { select: { id: true, name: true, email: true } },
      },
    });

    if (!app) {
      const err = new Error("Không tìm thấy hồ sơ ứng tuyển!");
      err.status = 404;
      throw err;
    }

    // Recruiter chỉ được đánh giá job do mình tạo, admin được phép tất
    const isOwner = String(app.job.created_by) === String(reviewer.id);
    if (!isOwner && !isAdmin) {
      const err = new Error("Bạn không có quyền đánh giá hồ sơ này!");
      err.status = 403;
      throw err;
    }

    // Cập nhật trạng thái review
    const updated = await prisma.application.update({
      where: { id: BigInt(applicationId) },
      data: {
        status: reviewData?.status ?? "accepted",
        review_note: reviewData?.note ?? null,
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
      },
      include: {
        job: { select: { id: true, title: true } },
        applicant: { select: { id: true, name: true, email: true } },
      },
    });

    // Trả về theo chuẩn DTO của project
    return toApplicationDTO(updated);
  },

  // Cập nhật hồ sơ ứng tuyển (partial update — chỉ thay đổi field có trong payload)
  async updateApplication(applicationId, user, updateData) {
    const appId = BigInt(applicationId);
    const isAdmin = user.role === "admin";

    // ===== Helper: kiểm tra quyền và trạng thái =====
    const validatePermission = (app) => {
      if (!app) {
        const err = new Error("Không tìm thấy hồ sơ ứng tuyển!");
        err.status = 404;
        throw err;
      }

      const isApplicant = String(app.applicant_id) === String(user.userId);
      if (!isApplicant && !isAdmin) {
        const err = new Error("Bạn không có quyền cập nhật hồ sơ này!");
        err.status = 403;
        throw err;
      }

      if (app.status !== "pending") {
        const err = new Error("Chỉ có thể chỉnh sửa hồ sơ chưa được duyệt!");
        err.status = 400;
        throw err;
      }
    };

    // ===== Helper: validate field riêng lẻ =====
    const validateField = (key, value) => {
      if (key === "phone" && value && !/^0\d{9}$/.test(String(value))) {
        const err = new Error("Số điện thoại không hợp lệ!");
        err.status = 400;
        throw err;
      }
      if (
        key === "cover_letter" &&
        typeof value === "string" &&
        !value.trim()
      ) {
        const err = new Error("Thư giới thiệu không được để trống!");
        err.status = 400;
        throw err;
      }
    };

    // ===== Helper: tạo dữ liệu cập nhật =====
    const buildUpdateData = (fields) => {
      const allowed = ["cover_letter", "cv", "phone"];
      const result = { updated_at: new Date() };

      for (const key of allowed) {
        if (!Object.hasOwn(fields, key)) {
          continue;
        }
        const value = fields[key];

        // bỏ qua giá trị rỗng/null/undefined
        if (
          value === null ||
          value === undefined ||
          (typeof value === "string" && value.trim() === "")
        ) {
          continue;
        }

        validateField(key, value);
        result[key] = value;
      }

      if (Object.keys(result).length === 1) {
        const err = new Error("Không có dữ liệu hợp lệ để cập nhật!");
        err.status = 400;
        throw err;
      }

      return result;
    };

    // ===== Main logic =====
    const app = await prisma.application.findUnique({
      where: { id: appId },
      include: {
        job: { select: { id: true, title: true, created_by: true } },
        applicant: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    validatePermission(app);
    const dataToUpdate = buildUpdateData(updateData);

    const updated = await prisma.application.update({
      where: { id: appId },
      data: dataToUpdate,
      include: {
        job: { select: { id: true, title: true } },
        applicant: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return toApplicationDTO(updated);
  },
};
