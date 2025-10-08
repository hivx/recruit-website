// services/jobService.js
const prisma = require("../utils/prisma");

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

  // Lấy danh sách tags (có thể là chuỗi hoặc mảng)
  const tags = Array.isArray(jobData.tags) ? [...new Set(jobData.tags)] : [];

  // Tạo job
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

      // Tạo hoặc nối tag
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
      tags: {
        include: { tag: true },
      },
    },
  });

  return job;
};

//Lấy danh sách Job với lọc + search + phân trang (có tags, company, location, created_by_name)
exports.getAllJobs = async ({
  filter = {},
  search = "",
  page = 1,
  limit = 10,
}) => {
  const skip = (page - 1) * limit;

  // 🔹 Lọc theo tag (dựa vào bảng chuẩn hóa Tag)
  const tagFilter =
    Array.isArray(filter.tags) && filter.tags.length > 0
      ? {
          tags: {
            some: {
              tag: {
                name: { in: filter.tags },
              },
            },
          },
        }
      : {};

  // 🔹 Điều kiện search (tìm trong nhiều cột)
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

  // 🔹 Gom tất cả điều kiện lại
  const where = {
    ...tagFilter,
    ...(searchConditions.length ? { OR: searchConditions } : {}),
  };

  // 🔹 Truy vấn song song: danh sách và tổng
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: {
        tags: {
          include: {
            tag: true, // lấy cả tên tag từ bảng Tag
          },
        },
      },
    }),
    prisma.job.count({ where }),
  ]);

  // Không làm phẳng tags, giữ nguyên cấu trúc chuẩn hóa
  // Nếu cần có thêm fallback, có thể map để đảm bảo tags luôn là mảng
  const formattedJobs = jobs.map((job) => ({
    ...job,
    tags: Array.isArray(job.tags)
      ? job.tags.map((t) => ({
          jobId: String(t.jobId),
          tagId: t.tagId,
          tag: {
            id: t.tag?.id ?? 0,
            name: t.tag?.name ?? "",
          },
        }))
      : [],
  }));

  return {
    jobs: formattedJobs,
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
      tags: {
        include: {
          tag: true, // thêm dòng này để lấy tên tag
        },
      },
      favorites: true, // nếu muốn biết ai đã favorite
    },
  });
};

//Cập nhật Job (thay toàn bộ tags nếu truyền vào)
exports.updateJob = async (id, data) => {
  const { tags, ...fields } = data;

  // 🔹 Nếu có danh sách tags mới: tạo nếu chưa tồn tại, rồi gắn vào
  if (Array.isArray(tags) && tags.length > 0) {
    const uniqueTags = [...new Set(tags.map((t) => t.trim()))];

    // Tạo tag mới nếu chưa có
    await Promise.all(
      uniqueTags.map(async (tagName) => {
        await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
      }),
    );
  }

  // 🔹 Cập nhật job
  const updated = await prisma.job.update({
    where: { id: BigInt(id) },
    data: {
      title: fields.title,
      company: fields.company,
      location: fields.location ?? null,
      description: fields.description ?? null,
      salary_min: fields.salary_min ?? null,
      salary_max: fields.salary_max ?? null,
      requirements: fields.requirements ?? null,
      updated_at: new Date(),

      ...(Array.isArray(tags) && tags.length > 0
        ? {
            tags: {
              deleteMany: {}, // xóa tất cả tags cũ
              create: await Promise.all(
                [...new Set(tags.map((t) => t.trim()))].map(async (tagName) => {
                  const tag = await prisma.tag.findUnique({
                    where: { name: tagName },
                    select: { id: true },
                  });
                  return {
                    tag: { connect: { id: tag.id } },
                  };
                }),
              ),
            },
          }
        : {}),
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // 🔹 Ép kiểu BigInt → String để JSON không lỗi
  return {
    ...updated,
    id: updated.id.toString(),
    created_by: updated.created_by?.toString(),
    tags: updated.tags.map((jt) => ({
      jobId: updated.id.toString(),
      tagId: jt.tagId,
      tag: jt.tag,
    })),
  };
};

//Xóa Job (dọn phụ thuộc trước để tránh lỗi FK)
exports.deleteJob = async (id) => {
  const jobId = BigInt(id);

  await prisma.$transaction([
    // Xóa các bảng liên quan đến job này
    prisma.userFavoriteJobs.deleteMany({ where: { job_id: jobId } }),
    prisma.jobTag.deleteMany({ where: { jobId } }), //  đổi từ job_id -> jobId
    prisma.application.deleteMany({ where: { job_id: jobId } }),
    prisma.userInterestHistory.deleteMany({ where: { job_id: jobId } }), //  thêm mới
    prisma.jobRecommendation.deleteMany({ where: { job_id: jobId } }), //  thêm mới

    // Cuối cùng xóa Job
    prisma.job.delete({ where: { id: jobId } }),
  ]);

  return { success: true };
};

//  Trả về tag phổ biến nhất - Thứ tự đặt route tĩnh cần đặt trước /:id (route động)
exports.getPopularTags = async () => {
  // Bước 1: Group theo tagId để đếm tần suất xuất hiện
  const grouped = await prisma.jobTag.groupBy({
    by: ["tagId"],
    _count: { tagId: true },
    orderBy: {
      _count: {
        tagId: "desc",
      },
    },
    take: 10,
  });

  // Bước 2: Lấy thông tin tên Tag tương ứng
  const tagIds = grouped.map((g) => g.tagId);
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds } },
    select: { id: true, name: true },
  });

  // Bước 3: Ghép tên Tag với số lượng
  return grouped.map((g) => ({
    tagId: g.tagId,
    tagName: tags.find((t) => t.id === g.tagId)?.name || null,
    count: g._count.tagId,
  }));
};

//  Lấy tất cả tag (distinct)
// exports.getAllTags = async () => { //tất cả tag dù có job hay không
//   const tags = await prisma.tag.findMany({
//     orderBy: { id: "asc" }, // sắp xếp cho dễ nhìn
//     select: { id: true, name: true },
//   });
//   return tags.map((t) => ({
//     id: t.id,
//     name: t.name,
//   }));
// };
exports.getAllTags = async () => {
  const tags = await prisma.tag.findMany({
    where: {
      jobs: {
        some: {}, // chỉ lấy tag có ít nhất 1 JobTag
      },
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: { jobs: true }, // đếm số job đang dùng tag này
      },
    },
    orderBy: {
      id: "asc", // sắp xếp theo thứ tự id tăng dần
    },
  });

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    jobCount: t._count.jobs,
  }));
};
