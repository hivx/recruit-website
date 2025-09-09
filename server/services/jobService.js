// services/jobService.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//  Tạo Job (kèm tags)
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

  const job = await prisma.job.create({
    data: {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location ?? null,
      description: jobData.description ?? null,
      salary_min: jobData.salary_min ?? null,
      salary_max: jobData.salary_max ?? null,
      requirements: jobData.requirements ?? null,
      created_by: BigInt(jobData.createdBy),
      created_by_name: createdByName,

      // Lưu tags vào bảng job_tags (quan hệ Job.tags)
      tags:
        Array.isArray(jobData.tags) && jobData.tags.length
          ? {
              create: [...new Set(jobData.tags)].map((t) => ({ tag: t })),
            }
          : undefined,
    },
    include: {
      tags: true,
    },
  });

  return job;
};

//  Lấy danh sách Job với lọc + search + phân trang (có tags, company, location, created_by_name)
exports.getAllJobs = async ({
  filter = {},
  search = "",
  page = 1,
  limit = 10,
}) => {
  const skip = (page - 1) * limit;

  // Lọc theo tag: bất kỳ tag nào trong danh sách
  const tagFilter =
    Array.isArray(filter.tags) && filter.tags.length > 0
      ? { tags: { some: { tag: { in: filter.tags } } } }
      : {};

  // Điều kiện search (tìm trong nhiều field)
  const searchConditions = search
    ? [
        { title: { contains: search } },
        { company: { contains: search } },
        { description: { contains: search } },
        { requirements: { contains: search } },
        { location: { contains: search } },
        { created_by_name: { contains: search } },
      ]
    : [];

  // Gom tất cả điều kiện lại
  const where = {
    ...tagFilter,
    ...(searchConditions.length ? { OR: searchConditions } : {}),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: { tags: true },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

//  Lấy Job theo ID (kèm creator, tags, favorites)
exports.getJobById = async (id) => {
  return prisma.job.findUnique({
    where: { id: BigInt(id) },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      tags: true,
      favorites: true, // nếu muốn biết những ai đã favorite (bảng pivot)
    },
  });
};

//  Cập nhật Job (thay toàn bộ tags nếu truyền vào)
exports.updateJob = async (id, data) => {
  const { tags, ...fields } = data;

  const updated = await prisma.job.update({
    where: { id: BigInt(id) },
    data: {
      title: fields.title,
      company: fields.company,
      location: fields.location ?? null,
      description: fields.description ?? null,
      salary: fields.salary ?? null,
      requirements: fields.requirements ?? null,
      updated_at: new Date(),

      ...(Array.isArray(tags)
        ? {
            // Xóa hết tags cũ rồi tạo mới
            tags: {
              deleteMany: {},
              create: [...new Set(tags)].map((t) => ({ tag: t })),
            },
          }
        : {}),
    },
    include: { tags: true },
  });

  return updated;
};

//  Xóa Job (dọn phụ thuộc trước để tránh lỗi FK)
exports.deleteJob = async (id) => {
  const jobId = BigInt(id);
  await prisma.$transaction([
    prisma.userFavoriteJobs.deleteMany({ where: { job_id: jobId } }),
    prisma.jobTag.deleteMany({ where: { job_id: jobId } }),
    prisma.application.deleteMany({ where: { job_id: jobId } }),
    prisma.job.delete({ where: { id: jobId } }),
  ]);
  return { success: true };
};

//  Trả về tag phổ biến nhất - Thứ tự đặt route tĩnh cần đặt trước /:id (route động)
exports.getPopularTags = async () => {
  const result = await prisma.jobTag.groupBy({
    by: ["tag"],
    _count: { tag: true },
    orderBy: {
      _count: {
        tag: "desc",
      },
    },
    take: 10,
  });
  return result.map((r) => ({ tag: r.tag, count: r._count.tag }));
};

//  Lấy tất cả tag (distinct)
exports.getAllTags = async () => {
  const result = await prisma.jobTag.findMany({
    distinct: ["tag"],
    select: { tag: true },
  });
  return result.map((r) => r.tag);
};
