// server/services/applicationService.js
const { logUserInterest } = require("../middleware/logUserInterest");
const { computeFitScore } = require("../utils/fitScore");
const prisma = require("../utils/prisma");

// Giữ nguyên đường dẫn import DTO đúng theo cây của bạn
const { toApplicationDTO } = require("../utils/serializers/application");
const { AppError } = require("../utils/thrErrors");
const emailService = require("./emailService");

/**
 * Gợi ý: dùng 1 helper nhỏ để map list -> DTO
 */
const mapDTO = (rows) => rows.map(toApplicationDTO);

// helper: map list application sang DTO
const mapListDTO = (list, baseUrl) =>
  list.map((a) => {
    const dto = toApplicationDTO(a);
    if (dto.cv) {
      dto.cv = `${baseUrl}/${dto.cv}`;
    }
    return dto;
  });

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
    // 3) Tính fit_score + fit_reason
    // ============================
    try {
      const userVector = await prisma.userVector.findUnique({
        where: { user_id: BigInt(userId) },
      });

      const jobVector = await prisma.jobVector.findUnique({
        where: { job_id: BigInt(jobId) },
      });

      if (userVector && jobVector) {
        const { score, explanation } = computeFitScore(userVector, jobVector);

        const reason = buildApplicationFitReason(explanation, score);

        await prisma.application.update({
          where: { id: app.id },
          data: {
            fit_score: score,
            fit_reason: reason,
          },
        });

        app.fit_score = score;
        app.fit_reason = reason;
      } else {
        console.warn(
          "[Application] Vector không tồn tại → bỏ qua tính fit_score",
        );
      }
    } catch (err) {
      console.warn("[Application] Lỗi tính fit_score:", err.message);
    }

    // ============================
    // 4) GỬI EMAIL (ỨNG VIÊN + NTD)
    // ============================
    try {
      const job = await prisma.job.findUnique({
        where: { id: BigInt(jobId) },
        include: {
          creator: { select: { name: true, email: true } }, // NTD
          company: { select: { legal_name: true } },
        },
      });

      const applicant = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        select: { name: true, email: true },
      });

      // ---- A) Email cho ỨNG VIÊN ----
      if (applicant?.email) {
        await emailService.sendEmail(
          applicant.email,
          "Bạn đã ứng tuyển thành công",
          `
          <div style="font-family: Arial; line-height: 1.6;">
            <p>Chào <b>${applicant.name || "bạn"}</b>,</p>

            <p>
              Hồ sơ ứng tuyển của bạn cho vị trí
              <b>${job.title}</b>
              ${job.company?.legal_name ? `tại <b>${job.company.legal_name}</b>` : ""}
              đã được gửi thành công.
            </p>

            <p>
              Nhà tuyển dụng sẽ xem xét hồ sơ và liên hệ với bạn nếu phù hợp.
            </p>

            <p>Chúc bạn may mắn!</p>

            <p style="margin-top:24px;">
              Trân trọng,<br/>
              <b>Recruitment System</b>
            </p>
          </div>
        `,
        );
      }

      // ---- B) Email cho NHÀ TUYỂN DỤNG ----
      if (job?.creator?.email) {
        const manageUrl = `${process.env.CLIENT_URL}/recruiter/applicants`;

        await emailService.sendEmail(
          job.creator.email,
          "Có ứng viên mới ứng tuyển",
          `
          <div style="font-family: Arial; line-height: 1.6;">
            <p>Chào <b>${job.creator.name}</b>,</p>

            <p>
              Vị trí tuyển dụng
              <b>${job.title}</b>
              ${job.company?.legal_name ? `(${job.company.legal_name})` : ""}
              vừa có <b>một ứng viên mới</b> nộp hồ sơ.
            </p>

            <p style="margin: 20px 0;">
              <a href="${manageUrl}" style="
                padding:10px 14px;
                background:#0ea5e9;
                color:#fff;
                text-decoration:none;
                border-radius:6px;
                font-weight:600;
              ">
                Xem danh sách ứng viên
              </a>
            </p>

            <p>
              Vui lòng truy cập hệ thống để xem chi tiết hồ sơ và phản hồi ứng viên.
            </p>

            <p style="margin-top:24px;">
              Trân trọng,<br/>
              <b>Recruitment System</b>
            </p>
          </div>
        `,
        );
      }
    } catch (e) {
      console.error("[Application Email] send failed:", e?.message);
      // không throw
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

  async getApplicantsByJob({ jobId, user, baseUrl }) {
    // 1) Kiểm tra job tồn tại
    const job = await prisma.job.findUnique({
      where: { id: BigInt(jobId) },
      select: { id: true, created_by: true },
    });

    if (!job) {
      throw new AppError("Không tìm thấy công việc!", 404);
    }

    // 2) Kiểm quyền
    const isOwner = job.created_by?.toString() === user.userId?.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new AppError("Bạn không có quyền xem ứng viên công việc này!", 403);
    }

    // 3) Lấy danh sách ứng viên
    const rows = await prisma.application.findMany({
      where: { job_id: BigInt(jobId) },
      include: { applicant: true },
      orderBy: { created_at: "desc" },
    });

    // 4) Trả về DTO đã chuẩn hoá
    return {
      totalApplicants: rows.length,
      applicants: mapListDTO(rows, baseUrl),
    };
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

    // ===== IDENTITY CHECK: tránh gửi email trùng =====
    const previousStatus = app.status;
    const nextStatus = reviewData?.status ?? "accepted";
    const shouldSendEmail = previousStatus !== nextStatus;

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

    // ===== GỬI EMAIL CHO ỨNG VIÊN =====
    if (shouldSendEmail && updated.applicant?.email) {
      try {
        const subjectMap = {
          accepted: "Hồ sơ ứng tuyển của bạn đã được chấp nhận",
          rejected: "Kết quả hồ sơ ứng tuyển",
        };

        const subject =
          subjectMap[nextStatus] || "Cập nhật trạng thái hồ sơ ứng tuyển";

        const isAccepted = nextStatus === "accepted";

        const html = `
          <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111;">
            <p>Chào <b>${updated.applicant.name || "bạn"}</b>,</p>

            <p>
              Hồ sơ ứng tuyển của bạn cho vị trí
              <b>${updated.job.title}</b>
              đã được nhà tuyển dụng xem xét.
            </p>

            ${
              isAccepted
                ? `
                  <p style="color:#16a34a;">
                    Chúc mừng bạn! Hồ sơ của bạn đã được <b>chấp nhận</b>.
                  </p>
                  <p>
                    Nhà tuyển dụng sẽ liên hệ với bạn trong thời gian sớm nhất để trao đổi các bước tiếp theo.
                  </p>
                `
                : `
                  <p style="color:#dc2626;">
                    Rất tiếc, hồ sơ của bạn <b>chưa phù hợp</b> ở thời điểm hiện tại.
                  </p>
                `
            }

            ${
              updated.review_note
                ? `
                  <blockquote style="
                    margin: 16px 0;
                    padding: 12px 16px;
                    background-color: #f9fafb;
                    border-left: 4px solid #94a3b8;
                  ">
                    ${updated.review_note}
                  </blockquote>
                `
                : ""
            }

            <p>
              Cảm ơn bạn đã quan tâm và ứng tuyển.
              Chúc bạn sớm tìm được cơ hội phù hợp.
            </p>

            <p style="margin-top: 32px;">
              Trân trọng,<br />
              <b>Recruitment System</b>
            </p>
          </div>
        `;

        await emailService.sendEmail(updated.applicant.email, subject, html);
      } catch (e) {
        console.error("[Email Application Review] send failed:", e?.message);
        // không throw
      }
    }

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
  /**
   * Lấy danh sách ứng viên của recruiter (all jobs)
   * - Có phân trang
   * - Có lọc theo status, jobId
   * - Trả về DTO chuẩn
   */
  async getApplicationsForRecruiter(
    recruiterId,
    { page = 1, limit = 10, status, jobId },
  ) {
    const skip = (page - 1) * limit;

    const where = {
      job: {
        created_by: BigInt(recruiterId),
      },
      ...(status ? { status } : {}),
      ...(jobId ? { job_id: BigInt(jobId) } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          applicant: true,
          job: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      applicants: rows.map(toApplicationDTO),
    };
  },
};

function buildApplicationFitReason(expl, score) {
  const lines = [];

  // ===== OVERALL =====
  const labelMap = {
    high: "Phù hợp cao",
    medium: "Phù hợp trung bình",
    low: "Phù hợp thấp",
  };

  const label = labelMap[expl.overall] ?? "Phù hợp thấp";
  lines.push(`Mức độ phù hợp: ${label} (${Math.round(score * 100)}%)`);

  // ===== SKILL =====
  if (expl.skills.mustCount > 0) {
    if (expl.skills.matchedMustCount === expl.skills.mustCount) {
      lines.push("• Đáp ứng đầy đủ kỹ năng bắt buộc");
    } else if (expl.skills.matchedMustCount > 0) {
      lines.push(
        `• Đáp ứng ${expl.skills.matchedMustCount}/${expl.skills.mustCount} kỹ năng bắt buộc`,
      );
    } else {
      lines.push("• Chưa đáp ứng kỹ năng bắt buộc");
    }
  }

  // ===== TAG / FIELD =====
  if (expl.tags.hasData && expl.tags.matched.length > 0) {
    lines.push("• Trùng lĩnh vực tuyển dụng");
  }

  // ===== SALARY =====
  if (expl.salary.comparable) {
    if (expl.salary.level === "higher") {
      lines.push("• Kỳ vọng lương thấp hơn mức đề xuất");
    } else if (expl.salary.level === "near") {
      lines.push("• Kỳ vọng lương phù hợp");
    } else if (expl.salary.level === "lower") {
      lines.push("• Kỳ vọng lương cao hơn mức đề xuất");
    }
  }

  // ===== LOCATION =====
  if (expl.location.level === "match") {
    lines.push("• Phù hợp khu vực làm việc");
  }

  return lines.join("\n");
}
