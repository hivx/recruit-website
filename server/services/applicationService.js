// services/applicationService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  // Tạo mới đơn ứng tuyển
  async createApplication({ jobId, coverLetter, userId, cv, phone }) {
    // 1. Kiểm tra job có tồn tại
    const job = await prisma.job.findUnique({
      where: { id: BigInt(jobId) },
    });
    if (!job) {
      const error = new Error('Công việc không tồn tại!');
      error.statusCode = 404;
      throw error;
    }

    // 2. Kiểm tra đã ứng tuyển chưa (job_id + applicant_id unique)
    const existing = await prisma.application.findFirst({
      where: {
        job_id: BigInt(jobId),
        applicant_id: BigInt(userId),
      },
    });
    if (existing) {
      const error = new Error('Bạn đã ứng tuyển công việc này rồi.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Tạo mới application
    const application = await prisma.application.create({
      data: {
        job_id: BigInt(jobId),
        applicant_id: BigInt(userId),
        cover_letter: coverLetter,
        cv: cv || null,
        phone: phone || null,
      },
    });

    return application;
  },

  // Lấy danh sách đơn ứng tuyển của 1 user
  async getApplicationsByUser(userId) {
    return await prisma.application.findMany({
      where: { applicant_id: BigInt(userId) },
      include: { job: true },
      orderBy: { created_at: 'desc' },
    });
  },

  // Lấy danh sách ứng viên ứng tuyển 1 job
  async getApplicationsByJob(jobId) {
    return await prisma.application.findMany({
      where: { job_id: BigInt(jobId) },
      include: { applicant: true },
      orderBy: { created_at: 'desc' },
    });
  },
};
