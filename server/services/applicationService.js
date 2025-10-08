// services/applicationService.js
const prisma = require("../utils/prisma");

module.exports = {
  // Tạo mới đơn ứng tuyển
  async validateApply({ jobId, userId, phone }) {
    // Kiểm tra số điện thoại
    if (phone && !/^0\d{9}$/.test(phone)) {
      const error = new Error("Số điện thoại không hợp lệ!");
      error.statusCode = 400;
      throw error;
    }

    // Job có tồn tại không
    const job = await prisma.job.findUnique({
      where: { id: BigInt(jobId) },
    });
    if (!job) {
      const error = new Error("Không tìm thấy công việc với ID đã cung cấp!");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra đã ứng tuyển chưa
    const existing = await prisma.application.findFirst({
      where: {
        job_id: BigInt(jobId),
        applicant_id: BigInt(userId),
      },
    });
    if (existing) {
      const error = new Error("Bạn đã ứng tuyển công việc này rồi!");
      error.statusCode = 400;
      throw error;
    }

    return true;
  },

  // Tạo đơn ứng tuyển
  async createApplication({ jobId, coverLetter, userId, cv, phone }) {
    return await prisma.application.create({
      data: {
        job_id: BigInt(jobId),
        applicant_id: BigInt(userId),
        cover_letter: coverLetter,
        cv: cv || null,
        phone: phone || null,
      },
    });
  },

  // Lấy danh sách đơn ứng tuyển của 1 user
  async getApplicationsByUser(userId) {
    return await prisma.application.findMany({
      where: { applicant_id: BigInt(userId) },
      include: { job: true },
      orderBy: { created_at: "desc" },
    });
  },

  // Lấy danh sách ứng viên ứng tuyển 1 job
  async getApplicationsByJob(jobId) {
    return await prisma.application.findMany({
      where: { job_id: BigInt(jobId) },
      include: { applicant: true },
      orderBy: { created_at: "desc" },
    });
  },
};
