// services/jobService.js
const { logUserInterest } = require("../middleware/logUserInterest");
const prisma = require("../utils/prisma");
const emailService = require("./emailService");

// helper: chuyển BigInt -> string cho các field khoá
function normalizeJob(job) {
  if (!job) {
    return job;
  }
  return {
    ...job,
    id: job.id?.toString?.() ?? job.id,
    created_by: job.created_by?.toString?.() ?? job.created_by,
    company_id: job.company_id?.toString?.() ?? job.company_id,
    // format tags (giữ nguyên cấu trúc chuẩn hoá)
    tags: Array.isArray(job.tags)
      ? job.tags.map((jt) => ({
          jobId: (jt.jobId ?? job.id)?.toString?.() ?? jt.jobId,
          tagId: jt.tagId,
          tag: jt.tag ? { id: jt.tag.id, name: jt.tag.name } : null,
        }))
      : [],
    // company/approval giữ nguyên (không BigInt)
  };
}

//  Tạo Job (kèm tags) + tạo JobApproval(pending)
exports.createJob = async (jobData) => {
  let createdByName = jobData.createdByName;

  // Nếu chưa có createdByName thì lấy từ user
  if (!createdByName && jobData.createdBy) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(jobData.createdBy) },
      select: { name: true },
    });
    if (user) {
      createdByName = user.name;
    }
  }

  // Lấy danh sách tags (nếu là mảng)
  const tags = Array.isArray(jobData.tags) ? [...new Set(jobData.tags)] : [];

  // company_id là bắt buộc theo schema mới
  const companyId =
    jobData.company_id ??
    jobData.companyId ?? // nếu FE gửi companyId
    null;

  if (!companyId) {
    const err = new Error("Thiếu company_id khi tạo công việc!");
    err.status = 400;
    throw err;
  }

  // Tạo job
  const job = await prisma.job.create({
    data: {
      title: jobData.title,
      company_id: BigInt(companyId), //  FK mới
      location: jobData.location ?? null,
      description: jobData.description ?? null,
      salary_min: jobData.salary_min ?? null,
      salary_max: jobData.salary_max ?? null,
      requirements: jobData.requirements ?? null,
      created_by: BigInt(jobData.createdBy),
      created_by_name: createdByName,
      // Tạo/gắn tag
      tags: tags.length
        ? {
            create: tags.map((t) => ({
              tag: {
                connectOrCreate: {
                  where: { name: t },
                  create: { name: t },
                },
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

  // Tạo bản ghi phê duyệt pending
  await prisma.jobApproval.create({
    data: { job_id: job.id },
  });

  // Lấy lại job kèm approval
  const fresh = await prisma.job.findUnique({
    where: { id: job.id },
    include: {
      company: { select: { id: true, legal_name: true } },
      tags: { include: { tag: true } },
      approval: true,
    },
  });

  return normalizeJob(fresh);
};

// Lấy danh sách Job với lọc + search + phân trang (chỉ trả job approved)
exports.getAllJobs = async ({
  filter = {},
  search = "",
  page = 1,
  limit = 10,
}) => {
  const skip = (page - 1) * limit;

  //  Lọc theo tag
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

  //  Điều kiện search (tìm nhiều cột) + theo tên công ty (relation)
  const searchConditions = search
    ? [
        { title: { contains: search } },
        { description: { contains: search } },
        { requirements: { contains: search } },
        { location: { contains: search } },
        { created_by_name: { contains: search } },
        { company: { legal_name: { contains: search } } }, //  search theo tên công ty
      ]
    : [];

  // Chỉ lấy job đã duyệt
  const approvalFilter = { approval: { status: "approved" } };

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
      },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs: jobs.map(normalizeJob),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

//  Lấy Job theo ID (kèm creator, company, approval, tags, favorites)
//  Mặc định chỉ trả job approved (route admin có thể làm riêng)
exports.getJobById = async (id, userId = null) => {
  const job = await prisma.job.findUnique({
    where: { id: BigInt(id) },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, legal_name: true } },
      approval: true,
      tags: { include: { tag: true } },
      favorites: true,
    },
  });

  if (!job) {
    const error = new Error("Không tìm thấy công việc!");
    error.statusCode = 404;
    throw error;
  }

  // Chỉ public khi đã duyệt
  if (job.approval?.status !== "approved") {
    const error = new Error("Công việc chưa được duyệt!");
    error.statusCode = 403;
    throw error;
  }

  // Ghi log hành vi "viewed" nếu có user đăng nhập
  if (userId) {
    logUserInterest({
      userId,
      job,
      source: "viewed",
      eventType: "open_detail",
    });
  }

  return normalizeJob(job);
};

// Cập nhật Job (thay toàn bộ tags nếu truyền vào)
// Lưu ý: không cho đổi company_id tại đây để tránh chuyển job giữa công ty (nếu cần, thêm rule riêng)
exports.updateJob = async (id, data) => {
  const { tags, ...fields } = data; // bỏ qua company thay đổi

  // Nếu có danh sách tags mới: tạo nếu chưa tồn tại, rồi gắn vào
  if (Array.isArray(tags) && tags.length > 0) {
    const uniqueTags = [...new Set(tags.map((t) => t.trim()))];
    await Promise.all(
      uniqueTags.map((tagName) =>
        prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        }),
      ),
    );
  }

  const updated = await prisma.job.update({
    where: { id: BigInt(id) },
    data: {
      title: fields.title,
      // company_id: (bị khoá bởi rule nghiệp vụ)
      location: fields.location ?? null,
      description: fields.description ?? null,
      salary_min: fields.salary_min ?? null,
      salary_max: fields.salary_max ?? null,
      requirements: fields.requirements ?? null,
      updated_at: new Date(),
      ...(Array.isArray(tags) && tags.length > 0
        ? {
            tags: {
              deleteMany: {}, // xoá tất cả tags cũ
              create: await Promise.all(
                [...new Set(tags.map((t) => t.trim()))].map(async (tagName) => {
                  const tag = await prisma.tag.findUnique({
                    where: { name: tagName },
                    select: { id: true },
                  });
                  return { tag: { connect: { id: tag.id } } };
                }),
              ),
            },
          }
        : {}),
    },
    include: {
      company: { select: { id: true, legal_name: true } },
      approval: true,
      tags: { include: { tag: true } },
    },
  });

  return normalizeJob(updated);
};

// Xóa Job (dọn phụ thuộc trước để tránh lỗi FK)
exports.deleteJob = async (id) => {
  const jobId = BigInt(id);

  await prisma.$transaction([
    prisma.userFavoriteJobs.deleteMany({ where: { job_id: jobId } }),
    prisma.jobTag.deleteMany({ where: { jobId } }),
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
  const grouped = await prisma.jobTag.groupBy({
    by: ["tagId"],
    _count: { tagId: true },
    orderBy: { _count: { tagId: "desc" } },
    take: 10,
  });

  const tagIds = grouped.map((g) => g.tagId);
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds } },
    select: { id: true, name: true },
  });

  return grouped.map((g) => ({
    tagId: g.tagId,
    tagName: tags.find((t) => t.id === g.tagId)?.name || null,
    count: g._count.tagId,
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
        <p>Recruit System</p>
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
        <p>Recruit System</p>
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
