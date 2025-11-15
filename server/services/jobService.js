// services/jobService.js
const { logUserInterest } = require("../middleware/logUserInterest");
const prisma = require("../utils/prisma");
const { toJobDTO } = require("../utils/serializers/job");
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

  let companyId = jobData.company_id ?? jobData.companyId;
  if (!companyId) {
    const ownedCompany = await prisma.company.findFirst({
      where: { owner_id: createdBy },
      select: { id: true },
    });
    companyId = ownedCompany?.id;
  }
  if (!companyId) {
    throw Object.assign(new Error("Thiếu company_id!"), { status: 400 });
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

  // 👇 thêm xử lý requiredSkills sau transaction
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
  return toJobDTO({ ...fullJob, requiredSkills });
};

/* ============================================================
   # UPDATE JOB — giữ nguyên logic, chỉ thêm skill update
   ============================================================ */
exports.updateJob = async (id, data) => {
  const { tags, requiredSkills, ...fields } = data;
  const jobId = BigInt(id);

  // ===== Helper nội bộ =====
  const buildUpdateFields = (fields) => {
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
      if (Object.hasOwn(fields, key)) {
        result[key] = fields[key];
      }
    }
    return result;
  };

  const buildTagsMutation = async (tags) => {
    if (!Array.isArray(tags)) {
      return null;
    }
    const uniqueNames = [
      ...new Set(tags.map((t) => String(t).trim()).filter(Boolean)),
    ];

    await Promise.all(
      uniqueNames.map((name) =>
        prisma.tag.upsert({ where: { name }, update: {}, create: { name } }),
      ),
    );

    const links = await Promise.all(
      uniqueNames.map(async (name) => {
        const tag = await prisma.tag.findUnique({
          where: { name },
          select: { id: true },
        });
        return { tag: { connect: { id: tag.id } } };
      }),
    );

    return { deleteMany: {}, create: links };
  };

  const upsertRequiredSkills = async (tx, jobId, requiredSkills) => {
    if (!Array.isArray(requiredSkills)) {
      return;
    }

    await tx.jobRequiredSkill.deleteMany({ where: { job_id: jobId } });

    if (requiredSkills.length === 0) {
      return;
    }

    const dataToInsert = [];
    for (const s of requiredSkills) {
      let skillId = s.skill_id ? Number(s.skill_id) : null;
      if (!skillId && s.name) {
        const name = String(s.name).trim();
        const existing = await tx.skill.findUnique({
          where: { name },
          select: { id: true },
        });
        if (existing) {
          skillId = existing.id;
        } else {
          const newSkill = await tx.skill.create({
            data: { name },
            select: { id: true },
          });
          skillId = newSkill.id;
        }
      }
      if (!skillId) {
        continue;
      }
      dataToInsert.push({
        job_id: jobId,
        skill_id: skillId,
        level_required: s.level_required ?? null,
        years_required: s.years_required ?? null,
        must_have: s.must_have ?? true,
      });
    }

    if (dataToInsert.length) {
      await tx.jobRequiredSkill.createMany({ data: dataToInsert });
    }
  };

  // ===== Xử lý chính =====
  const dataToUpdate = buildUpdateFields(fields);
  const tagMutation = await buildTagsMutation(tags);

  const updatedJob = await prisma.$transaction(async (tx) => {
    const updated = await tx.job.update({
      where: { id: jobId },
      data: {
        ...dataToUpdate,
        ...(tagMutation ? { tags: tagMutation } : {}),
      },
      include: {
        company: { select: { id: true, legal_name: true } },
        approval: true,
        tags: { include: { tag: true } },
      },
    });

    if (Array.isArray(requiredSkills)) {
      await upsertRequiredSkills(tx, jobId, requiredSkills);
    }

    return updated;
  });

  const required = await prisma.jobRequiredSkill.findMany({
    where: { job_id: jobId },
    include: { skill: true },
  });

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
      company: { select: { id: true, legal_name: true } },
      approval: true,
      tags: { include: { tag: true } },
      favorites: user ? { where: { user_id: BigInt(user.id) } } : false, // tránh trả về list user
      requiredSkills: { include: { skill: true } },
      vector: true, // nếu dùng vector
    },
  });

  if (!job) {
    const err = new Error("Không tìm thấy công việc!");
    err.statusCode = 404;
    throw err;
  }

  const approved = job.approval?.status === "approved";

  const isOwner = user && String(job.created_by) === String(user.id);

  if (!approved && !(allowOwnerDraft && isOwner)) {
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

  return toJobDTO(job);
};

// Lấy danh sách Job với lọc + search + phân trang (chỉ trả job approved)
exports.getAllJobs = async ({
  filter = {},
  search = "",
  page = 1,
  limit = 10,
}) => {
  const skip = (page - 1) * limit;

  // Filter tag: dùng tag_id
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

  // Search multi-field (insensitive)
  const searchConditions = search
    ? [
        { title: { contains: search } },
        { description: { contains: search } },
        { requirements: { contains: search } },
        { location: { contains: search } },
        { created_by_name: { contains: search } },
        {
          company: {
            is: { legal_name: { contains: search } },
          },
        },
      ]
    : [];

  // Chỉ lấy job đã approved
  const approvalFilter = { approval: { is: { status: "approved" } } };

  const where = {
    ...tagFilter,
    ...approvalFilter,
    ...(searchConditions.length ? { OR: searchConditions } : {}),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: {
        company: { select: { id: true, legal_name: true } },
        approval: true,
        tags: { include: { tag: true } },
        requiredSkills: { include: { skill: true } },
        vector: true,
      },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs: jobs.map(toJobDTO),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// Xóa Job (dọn phụ thuộc trước để tránh lỗi FK)
exports.deleteJob = async (id) => {
  const jobId = BigInt(id);

  await prisma.$transaction([
    prisma.userFavoriteJobs.deleteMany({ where: { job_id: jobId } }),
    prisma.jobTag.deleteMany({ where: { job_id: jobId } }), // sửa đúng tên field
    prisma.jobRequiredSkill.deleteMany({ where: { job_id: jobId } }), // bổ sung xoá kỹ năng yêu cầu
    prisma.application.deleteMany({ where: { job_id: jobId } }),
    prisma.userInterestHistory.deleteMany({ where: { job_id: jobId } }),
    prisma.jobRecommendation.deleteMany({ where: { job_id: jobId } }),
    prisma.jobApproval.deleteMany({ where: { job_id: jobId } }),
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

//  Lấy tất cả tag có sử dụng bởi job
exports.getAllTags = async () => {
  const tags = await prisma.tag.findMany({
    where: { jobs: { some: {} } },
    select: {
      id: true,
      name: true,
      _count: { select: { jobs: true } },
    },
    orderBy: { id: "asc" },
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
      creator: { select: { id: true, name: true, email: true } }, // lấy chủ job để gửi mail
      company: { select: { legal_name: true } },
    },
  });
  if (!job) {
    const e = new Error("Không tìm thấy job.");
    e.status = 404;
    throw e;
  }

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

  // Gửi email thông báo cho recruiter
  try {
    const manageUrl = `${process.env.CLIENT_URL}/dashboard/jobs/${job.id.toString()}`;
    await emailService.sendEmail(
      job.creator.email,
      "Bài đăng tuyển dụng đã được DUYỆT",
      `
        <p>Chào ${job.creator.name},</p>
        <p>Job <b>${job.title}</b> (${job.company?.legal_name || "Company"}) đã được <b>DUYỆT</b>.</p>
        <p>Bạn có thể xem chi tiết tại: <a href="${manageUrl}">${manageUrl}</a></p>
        <p>Trân trọng,</p>
        <p>Recruitment System</p>
      `,
    );
  } catch (error_) {
    console.error("[Email Approve Job] send failed:", error_?.message);
    // không throw để tránh làm fail API duyệt
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

  // Gửi email thông báo từ chối cho recruiter
  try {
    const manageUrl = `${process.env.CLIENT_URL}/dashboard/jobs/${job.id.toString()}/edit`;
    await emailService.sendEmail(
      job.creator.email,
      "Bài đăng tuyển dụng bị TỪ CHỐI",
      `
        <p>Chào ${job.creator.name},</p>
        <p>Job <b>${job.title}</b> (${job.company?.legal_name || "Company"}) đã bị <b>TỪ CHỐI</b>.</p>
        <p><b>Lý do:</b> ${reason || "Không có lý do cụ thể."}</p>
        <p>Vui lòng chỉnh sửa và nộp lại: <a href="${manageUrl}">${manageUrl}</a></p>
        <p>Trân trọng,</p>
        <p>Recruitment System</p>
      `,
    );
  } catch (error_) {
    console.error("[Email Reject Job] send failed:", error_?.message);
    // không throw để tránh làm fail API
  }

  return {
    job_id: job.id.toString(),
    status: approval.status,
    reason: approval.reason,
  };
};
