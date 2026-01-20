// server/services/jobService.js
const { emitEvent } = require("../events");
const { logUserInterest } = require("../middleware/logUserInterest");
const prisma = require("../utils/prisma");
const { toJobDTO } = require("../utils/serializers/job");
const { shouldUpdate } = require("../utils/shouldUpdate");
const emailService = require("./emailService");

/* ============================================================
   # Helper: Xử lý kỹ năng yêu cầu của Job (JobRequiredSkill)
   ============================================================ */
const JobRequiredSkillService = {
  async upsert(jobId, skills = []) {
    if (!Array.isArray(skills)) {
      return;
    }
    const job_id = BigInt(jobId);

    // Xóa kỹ năng cũ trước
    await prisma.jobRequiredSkill.deleteMany({ where: { job_id } });

    if (skills.length === 0) {
      return;
    }

    const dataToInsert = [];

    for (const s of skills) {
      // Cho phép FE gửi theo name hoặc skill_id
      let skillId = s.skill_id ? Number(s.skill_id) : null;

      if (!skillId && s.name) {
        // Tìm theo tên kỹ năng
        const existing = await prisma.skill.findUnique({
          where: { name: s.name.trim() },
          select: { id: true },
        });

        if (existing) {
          skillId = existing.id;
        } else {
          // Nếu chưa có skill thì tạo mới
          const newSkill = await prisma.skill.create({
            data: { name: s.name.trim() },
            select: { id: true },
          });
          skillId = newSkill.id;
        }
      }

      if (!skillId) {
        continue; // bỏ qua nếu name trống
      }

      dataToInsert.push({
        job_id,
        skill_id: skillId,
        level_required: s.level_required ?? null,
        years_required: s.years_required ?? null,
        must_have: s.must_have ?? true,
      });
    }

    if (dataToInsert.length > 0) {
      await prisma.jobRequiredSkill.createMany({ data: dataToInsert });
    }
  },

  async fetchForJob(jobId) {
    return prisma.jobRequiredSkill.findMany({
      where: { job_id: BigInt(jobId) },
      include: { skill: true },
    });
  },
};

/* ============================================================
   # CREATE JOB — giữ logic cũ, chèn xử lý requiredSkills
   ============================================================ */
exports.createJob = async (jobData) => {
  const title = (jobData.title || "").trim();
  if (!title) {
    throw Object.assign(new Error("Thiếu tiêu đề công việc!"), { status: 400 });
  }
  if (!jobData.createdBy) {
    throw Object.assign(new Error("Thiếu createdBy!"), { status: 400 });
  }

  const createdBy = BigInt(String(jobData.createdBy));

  let createdByName = jobData.createdByName;
  if (!createdByName) {
    const u = await prisma.user.findUnique({
      where: { id: createdBy },
      select: { name: true },
    });
    createdByName = u?.name || null;
  }
  const user = await prisma.user.findUnique({
    where: { id: createdBy },
    select: { role: true },
  });
  const userRole = user?.role;

  let companyId = jobData.company_id ?? jobData.companyId;

  // 1) Nếu FE không gửi → lấy công ty của recruiter
  if (!companyId) {
    const ownedCompany = await prisma.company.findFirst({
      where: { owner_id: createdBy },
      include: { verification: true },
    });

    if (!ownedCompany) {
      throw Object.assign(new Error("Bạn chưa có công ty!"), { status: 400 });
    }

    companyId = ownedCompany.id;

    // Nếu bạn yêu cầu company phải được verified
    if (ownedCompany.verification?.status !== "verified") {
      throw Object.assign(new Error("Công ty chưa được xác thực!"), {
        status: 403,
      });
    }
  }

  // 2) Kiểm tra companyId có tồn tại
  const companyExists = await prisma.company.findUnique({
    where: { id: BigInt(companyId) },
    include: { verification: true },
  });

  if (!companyExists) {
    throw Object.assign(new Error("Công ty không tồn tại!"), {
      status: 404,
    });
  }

  // 3) Kiểm tra người tạo job có sở hữu company không (trừ admin)
  if (
    userRole !== "admin" &&
    companyExists.owner_id.toString() !== createdBy.toString()
  ) {
    throw Object.assign(new Error("Bạn không sở hữu công ty này!"), {
      status: 403,
    });
  }

  // 4) Kiểm tra company đã verified (tùy policy)
  if (companyExists.verification?.status !== "verified") {
    throw Object.assign(
      new Error("Công ty chưa được xác thực — không thể đăng job."),
      { status: 403 },
    );
  }

  const tags = Array.isArray(jobData.tags)
    ? [...new Set(jobData.tags.map((t) => String(t).trim()).filter(Boolean))]
    : [];

  // Transaction cũ giữ nguyên
  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.job.create({
      data: {
        title,
        company_id: BigInt(companyId),
        location: jobData.location ?? null,
        description: jobData.description ?? null,
        salary_min: jobData.salary_min ?? null,
        salary_max: jobData.salary_max ?? null,
        requirements: jobData.requirements ?? null,
        created_by: createdBy,
        created_by_name: createdByName,
        tags: tags.length
          ? {
              create: tags.map((t) => ({
                tag: {
                  connectOrCreate: { where: { name: t }, create: { name: t } },
                },
              })),
            }
          : undefined,
      },
      include: {
        company: { select: { id: true, legal_name: true } },
        tags: { include: { tag: true } },
      },
    });

    await tx.jobApproval.create({ data: { job_id: created.id } });
    return created;
  });

  // thêm xử lý requiredSkills sau transaction
  await JobRequiredSkillService.upsert(job.id, jobData.requiredSkills || []);

  // Lấy lại job đầy đủ
  const fullJob = await prisma.job.findUnique({
    where: { id: job.id },
    include: {
      company: { select: { id: true, legal_name: true } },
      approval: true,
      tags: { include: { tag: true } },
    },
  });

  const requiredSkills = await JobRequiredSkillService.fetchForJob(job.id);

  // Emit event JOB_CHANGED để xây dựng vector
  emitEvent("JOB_CHANGED", { jobId: job.id });

  return toJobDTO({ ...fullJob, requiredSkills });
};

/* ============================================================
   # UPDATE JOB — giữ nguyên logic, chỉ thêm skill update
   ============================================================ */
exports.updateJob = async (id, data) => {
  const jobId = BigInt(id);

  const { tags, requiredSkills, ...fields } = data;

  // ========= 1. FIELD UPDATE (partial như updateApplication) =========
  const buildUpdateFields = () => {
    const allowed = [
      "title",
      "location",
      "description",
      "salary_min",
      "salary_max",
      "requirements",
    ];

    const result = { updated_at: new Date() };

    for (const key of allowed) {
      if (Object.hasOwn(fields, key) && shouldUpdate(fields[key])) {
        result[key] = fields[key];
      }
    }

    return result;
  };

  // ========= 2. TAGS UPDATE =========
  const updateTags = async (tx) => {
    if (tags === undefined) {
      return {};
    }

    if (!Array.isArray(tags)) {
      return {};
    }

    const clean = [
      ...new Set(tags.map((t) => String(t).trim()).filter(Boolean)),
    ];

    if (clean.length === 0) {
      // Xóa toàn bộ tags của job
      return {
        tags: {
          deleteMany: {}, // Prisma sẽ chạy trong transaction tx
        },
      };
    }

    // Tạo tags nếu chưa có
    await Promise.all(
      clean.map((name) =>
        tx.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );

    const rows = await tx.tag.findMany({
      where: { name: { in: clean } },
      select: { id: true },
    });

    return {
      tags: {
        deleteMany: {},
        create: rows.map((t) => ({
          tag: { connect: { id: t.id } },
        })),
      },
    };
  };

  // ========= 3. REQUIRED SKILLS UPDATE =========
  const updateRequiredSkills = async (tx) => {
    if (requiredSkills === undefined) {
      // FE không gửi → giữ nguyên
      return;
    }

    if (!Array.isArray(requiredSkills)) {
      // FE gửi null/"" → giữ nguyên
      return;
    }

    // FE gửi [] → xoá hết
    if (requiredSkills.length === 0) {
      await tx.jobRequiredSkill.deleteMany({ where: { job_id: jobId } });
      return;
    }

    // FE gửi array → replace
    await tx.jobRequiredSkill.deleteMany({ where: { job_id: jobId } });

    const skillNames = [
      ...new Set(
        requiredSkills.map((s) => String(s.name || "").trim()).filter(Boolean),
      ),
    ];

    // Create skills if needed
    await Promise.all(
      skillNames.map((name) =>
        tx.skill.upsert({ where: { name }, update: {}, create: { name } }),
      ),
    );

    const skillRows = await tx.skill.findMany({
      where: { name: { in: skillNames } },
    });

    const toInsert = requiredSkills
      .map((s) => {
        const cleanName = String(s.name).trim();
        const found = skillRows.find((x) => x.name === cleanName);
        if (!found) {
          return null;
        }

        return {
          job_id: jobId,
          skill_id: found.id,
          level_required: s.level_required ?? null,
          years_required: s.years_required ?? null,
          must_have: s.must_have !== false,
        };
      })
      .filter(Boolean);

    if (toInsert.length) {
      await tx.jobRequiredSkill.createMany({ data: toInsert });
    }
  };

  // ========= 4. MAIN UPDATE =========
  const updatedJob = await prisma.$transaction(async (tx) => {
    const tagMutation = await updateTags(tx);
    const dataToUpdate = buildUpdateFields();

    const updated = await tx.job.update({
      where: { id: jobId },
      data: { ...dataToUpdate, ...tagMutation },
      include: {
        company: { select: { id: true, legal_name: true, logo: true } },
        approval: true,
        tags: { include: { tag: true } },
      },
    });

    // ===== RESET APPROVAL IF JOB CHANGED =====
    const shouldResetApproval =
      Object.keys(dataToUpdate).length > 1 ||
      tags !== undefined ||
      requiredSkills !== undefined;

    if (shouldResetApproval) {
      await tx.jobApproval.updateMany({
        where: { job_id: jobId },
        data: {
          status: "pending",
          reason: null,
          auditor_id: null,
          audited_at: null,
        },
      });
    }

    await updateRequiredSkills(tx);

    return updated;
  });

  const required = await prisma.jobRequiredSkill.findMany({
    where: { job_id: jobId },
    include: { skill: true },
  });

  // Emit event JOB_CHANGED để xây dựng vector
  emitEvent("JOB_CHANGED", { jobId });

  return toJobDTO({ ...updatedJob, requiredSkills: required });
};

/* ============================================================
   # GET JOB BY ID — chỉ thêm include requiredSkills
   ============================================================ */
exports.getJobById = async (id, user, opts = {}) => {
  const { allowOwnerDraft = false } = opts;

  const job = await prisma.job.findUnique({
    where: { id: BigInt(id) },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, legal_name: true, logo: true } },
      approval: true,
      tags: { include: { tag: true } },
      requiredSkills: { include: { skill: true } },
      vector: true,
    },
  });

  if (!job) {
    const err = new Error("Không tìm thấy công việc!");
    err.statusCode = 404;
    throw err;
  }

  const approved = job.approval?.status === "approved";
  const isOwner = user && String(job.created_by) === String(user.id);

  if (
    !approved &&
    !(allowOwnerDraft && isOwner) &&
    (!user || user.role !== "admin")
  ) {
    const err = new Error("Công việc chưa được duyệt hoặc bạn không có quyền!");
    err.statusCode = 403;
    throw err;
  }

  if (user && (approved || (allowOwnerDraft && isOwner))) {
    logUserInterest({
      userId: user.id,
      job,
      source: "viewed",
      eventType: "open_detail",
    });
  }
  // ===== NEW: Tính isFavorite =====
  let isFavorite = false;

  if (user) {
    const fav = await prisma.userFavoriteJobs.findFirst({
      where: { user_id: BigInt(user.id), job_id: BigInt(id) },
    });
    isFavorite = !!fav;
  }

  return {
    ...toJobDTO(job),
    isFavorite,
  };
};

// Lấy danh sách Job với lọc + search + phân trang (chỉ trả job approved)
exports.getAllJobs = async ({
  filter = {},
  search = "",
  page = 1,
  limit = 10,
  currentUser = null,
}) => {
  const skip = (page - 1) * limit;

  // TAG filter
  const tagFilter =
    Array.isArray(filter.tags) && filter.tags.length > 0
      ? {
          tags: {
            some: {
              tag: { name: { in: filter.tags } },
            },
          },
        }
      : {};

  // LOCATION filter linh hoạt
  const locationFilter =
    typeof filter.location === "string" && filter.location.trim().length > 0
      ? {
          location: {
            contains: filter.location.trim(),
          },
        }
      : {};

  // SALARY filter
  const salaryFilter =
    filter.salaryWanted && !Number.isNaN(filter.salaryWanted)
      ? {
          salary_min: { lte: filter.salaryWanted },
          salary_max: { gte: filter.salaryWanted },
        }
      : {};

  // SEARCH fulltext
  const searchConditions = search
    ? [
        { title: { contains: search } },
        { description: { contains: search } },
        { requirements: { contains: search } },
        { created_by_name: { contains: search } },
        {
          company: {
            is: { legal_name: { contains: search } },
          },
        },
      ]
    : [];

  const isAdmin = currentUser?.role === "admin";
  // WHERE final
  const where = {
    ...tagFilter,
    ...locationFilter,
    ...salaryFilter,
    ...(!isAdmin && {
      approval: { is: { status: "approved" } },
    }),
    ...(searchConditions.length ? { OR: searchConditions } : {}),
  };

  // Query jobs and count
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: {
        company: { select: { id: true, legal_name: true, logo: true } },
        approval: true,
        tags: { include: { tag: true } },
        requiredSkills: { include: { skill: true } },
        vector: true,
      },
    }),

    prisma.job.count({ where }),
  ]);

  // Favorite jobs
  let favoriteIds = new Set();
  if (currentUser) {
    const favorites = await prisma.userFavoriteJobs.findMany({
      where: { user_id: BigInt(currentUser.id) },
      select: { job_id: true },
    });
    favoriteIds = new Set(favorites.map((f) => Number(f.job_id)));
  }

  const jobList = jobs.map((job) => ({
    ...toJobDTO(job),
    isFavorite: currentUser ? favoriteIds.has(Number(job.id)) : false,
  }));

  return {
    jobs: jobList,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// Xóa Job hoàn chỉnh (xóa vector + toàn bộ phụ thuộc)
exports.deleteJob = async (id) => {
  const jobId = BigInt(id);

  await prisma.$transaction([
    // 1) xoá các tương tác của user
    prisma.userFavoriteJobs.deleteMany({ where: { job_id: jobId } }),
    prisma.userInterestHistory.deleteMany({ where: { job_id: jobId } }),

    // 2) xoá các liên kết job → tags / skills
    prisma.jobTag.deleteMany({ where: { job_id: jobId } }),
    prisma.jobRequiredSkill.deleteMany({ where: { job_id: jobId } }),

    // 3) xoá các ứng tuyển liên quan
    prisma.application.deleteMany({ where: { job_id: jobId } }),

    // 4) xoá recommendation liên quan
    prisma.jobRecommendation.deleteMany({ where: { job_id: jobId } }),

    // 5) xoá approval log
    prisma.jobApproval.deleteMany({ where: { job_id: jobId } }),

    // 6) xoá vector job
    prisma.jobVector.deleteMany({ where: { job_id: jobId } }),

    // 7) cuối cùng xoá job
    prisma.job.delete({ where: { id: jobId } }),
  ]);

  return { success: true };
};

//  Trả về tag phổ biến nhất
exports.getPopularTags = async () => {
  // group theo đúng field trong Prisma model: tag_id
  const grouped = await prisma.jobTag.groupBy({
    by: ["tag_id"],
    _count: { tag_id: true },
    orderBy: { _count: { tag_id: "desc" } },
    take: 10,
  });

  if (!grouped.length) {
    return [];
  }

  const tagIds = grouped.map((g) => g.tag_id);

  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds } },
    select: { id: true, name: true },
  });

  // map để tra cứu O(1)
  const nameById = new Map(tags.map((t) => [t.id, t.name]));

  return grouped.map((g) => ({
    tagId: g.tag_id,
    tagName: nameById.get(g.tag_id) || null,
    count: g._count.tag_id,
  }));
};

//  Lấy tất cả tag
exports.getAllTags = async () => {
  const tags = await prisma.tag.findMany({
    // where: { jobs: { some: {} } },
    select: {
      id: true,
      name: true,
      _count: { select: { jobs: true } },
    },
    orderBy: {
      name: "asc",
    },
  });

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    jobCount: t._count.jobs,
  }));
};

// ADMIN duyệt job
exports.approveJob = async (jobId, adminId) => {
  const job = await prisma.job.findUnique({
    where: { id: BigInt(jobId) },
    include: {
      approval: true,
      creator: { select: { id: true, name: true, email: true } },
      company: { select: { legal_name: true } },
    },
  });

  if (!job) {
    const e = new Error("Không tìm thấy job.");
    e.status = 404;
    throw e;
  }

  // ===== 3.1 IDENTITY CHECK (chặn gửi trùng) =====
  const previousStatus = job.approval?.status;
  const shouldSendEmail = previousStatus !== "approved";

  const approval = await prisma.jobApproval.upsert({
    where: { job_id: job.id },
    update: {
      status: "approved",
      reason: null,
      auditor_id: BigInt(adminId),
      audited_at: new Date(),
    },
    create: {
      job_id: job.id,
      status: "approved",
      auditor_id: BigInt(adminId),
      audited_at: new Date(),
    },
  });

  // ===== GỬI EMAIL CHỈ KHI TRẠNG THÁI THỰC SỰ ĐỔI =====
  if (shouldSendEmail) {
    try {
      const manageUrl = `${process.env.CLIENT_URL}/jobs/${job.id.toString()}`;

      const subject = "Bài đăng tuyển dụng của bạn đã được duyệt";

      const html = `
        <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111;">
          <p>Chào <b>${job.creator.name}</b>,</p>

          <p>
            Bài đăng tuyển dụng
            <b>${job.title}</b>
            ${job.company?.legal_name ? `(${job.company.legal_name})` : ""}
            đã được <b style="color:#0ea5e9;">DUYỆT</b>.
          </p>

          <p>
            Bài đăng của bạn hiện đã được hiển thị và bắt đầu tiếp cận ứng viên phù hợp.
          </p>

          <p style="margin: 24px 0;">
            <a
              href="${manageUrl}"
              style="
                display: inline-block;
                padding: 10px 16px;
                background-color: #0ea5e9;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
              "
            >
              Xem bài đăng tuyển dụng
            </a>
          </p>

          <p>
            Nếu cần chỉnh sửa nội dung hoặc theo dõi ứng viên, bạn có thể thực hiện trực tiếp tại trang quản lý job.
          </p>

          <p>Chúc bạn sớm tìm được ứng viên phù hợp.</p>

          <p style="margin-top: 32px;">
            Trân trọng,<br />
            <b>Recruitment System</b>
          </p>
        </div>
      `;

      await emailService.sendEmail(job.creator.email, subject, html);
    } catch (error_) {
      console.error("[Email Approve Job] send failed:", error_?.message);
      // không throw để tránh làm fail API duyệt
    }
  }

  return {
    job_id: job.id.toString(),
    status: approval.status,
    audited_at: approval.audited_at,
  };
};

// ADMIN từ chối job
exports.rejectJob = async (jobId, adminId, reason) => {
  const job = await prisma.job.findUnique({
    where: { id: BigInt(jobId) },
    include: {
      approval: true,
      creator: { select: { id: true, name: true, email: true } },
      company: { select: { legal_name: true } },
    },
  });

  if (!job) {
    const e = new Error("Không tìm thấy job.");
    e.status = 404;
    throw e;
  }

  // ===== 3.1 IDENTITY CHECK (chặn gửi email trùng) =====
  const previousStatus = job.approval?.status;
  const shouldSendEmail = previousStatus !== "rejected";

  const approval = await prisma.jobApproval.upsert({
    where: { job_id: job.id },
    update: {
      status: "rejected",
      reason,
      auditor_id: BigInt(adminId),
      audited_at: new Date(),
    },
    create: {
      job_id: job.id,
      status: "rejected",
      reason,
      auditor_id: BigInt(adminId),
      audited_at: new Date(),
    },
  });

  // ===== GỬI EMAIL CHỈ KHI TRẠNG THÁI THỰC SỰ ĐỔI =====
  if (shouldSendEmail) {
    try {
      const editUrl = `${process.env.CLIENT_URL}/recruiter/jobs`;

      const subject = "Bài đăng tuyển dụng cần chỉnh sửa trước khi hiển thị";

      const html = `
        <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111;">
          <p>Chào <b>${job.creator.name}</b>,</p>

          <p>
            Bài đăng tuyển dụng
            <b>${job.title}</b>
            ${job.company?.legal_name ? `(${job.company.legal_name})` : ""}
            <b style="color:#dc2626;">chưa được phê duyệt</b> tại thời điểm này.
          </p>

          <p>
            Dưới đây là lý do để bạn có thể rà soát và điều chỉnh nội dung:
          </p>

          <blockquote
            style="
              margin: 16px 0;
              padding: 12px 16px;
              background-color: #fef2f2;
              border-left: 4px solid #dc2626;
            "
          >
            ${reason || "Không có lý do cụ thể."}
          </blockquote>

          <p>
            Sau khi cập nhật, bạn có thể gửi lại bài đăng để được xem xét phê duyệt.
          </p>

          <p style="margin: 24px 0;">
            <a
              href="${editUrl}"
              style="
                display: inline-block;
                padding: 10px 16px;
                background-color: #dc2626;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
              "
            >
              Chỉnh sửa bài đăng
            </a>
          </p>

          <p>
            Nếu bạn cần hỗ trợ thêm trong quá trình chỉnh sửa, vui lòng phản hồi lại email này hoặc liên hệ đội ngũ hỗ trợ.
          </p>

          <p style="margin-top: 32px;">
            Trân trọng,<br />
            <b>Recruitment System</b>
          </p>
        </div>
      `;

      await emailService.sendEmail(job.creator.email, subject, html);
    } catch (error_) {
      console.error("[Email Reject Job] send failed:", error_?.message);
      // không throw để tránh làm fail API
    }
  }

  return {
    job_id: job.id.toString(),
    status: approval.status,
    reason: approval.reason,
    audited_at: approval.audited_at,
  };
};

// ===============================
// GET JOBS CREATED BY CURRENT USER (Lấy job tạo bởi người dùng)
// ===============================
exports.getMyJobs = async ({ userId, role, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const isAdmin = role === "admin";

  const where = {
    ...(!isAdmin && {
      created_by: BigInt(userId),
    }),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: {
        company: { select: { id: true, legal_name: true, logo: true } },
        approval: true,
        tags: { include: { tag: true } },
        requiredSkills: { include: { skill: true } },
        vector: true,
      },
    }),

    prisma.job.count({ where }),
  ]);

  return {
    jobs: jobs.map((job) => toJobDTO(job)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
