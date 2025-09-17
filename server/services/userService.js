// services/userService.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

module.exports = {
  async getUserById(userId) {
    return prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        favorites: { include: { job: true } },
      },
    });
  },

  async updateUser(userId, data) {
    return prisma.user.update({
      where: { id: BigInt(userId) },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.avatar && { avatar: data.avatar }),
        ...(data.password && { password: data.password }),
      },
    });
  },

  async getUserByEmail(email, excludeUserId) {
    return prisma.user.findFirst({
      where: {
        email,
        NOT: { id: excludeUserId },
      },
    });
  },

  // Toggle yêu thích
  async toggleFavoriteJob(userId, jobId) {
    // Kiểm tra job tồn tại
    const job = await prisma.job.findUnique({
      where: { id: BigInt(jobId) },
    });
    if (!job) {
      const error = new Error("Không tìm thấy công việc với ID này!");
      error.status = 404;
      throw error;
    }

    // Kiểm tra đã yêu thích chưa
    const exists = await prisma.userFavoriteJobs.findUnique({
      where: {
        user_id_job_id: {
          user_id: BigInt(userId),
          job_id: BigInt(jobId),
        },
      },
    });

    if (exists) {
      await prisma.userFavoriteJobs.delete({
        where: {
          user_id_job_id: {
            user_id: BigInt(userId),
            job_id: BigInt(jobId),
          },
        },
      });
      return { message: "Đã gỡ khỏi danh sách yêu thích" };
    }

    await prisma.userFavoriteJobs.create({
      data: {
        user_id: BigInt(userId),
        job_id: BigInt(jobId),
      },
    });
    return { message: "Đã thêm vào danh sách yêu thích" };
  },

  async getFavoriteJobs(userId) {
    const favorites = await prisma.userFavoriteJobs.findMany({
      where: { user_id: BigInt(userId) },
      include: { job: true },
    });

    return {
      jobs: favorites.map((f) => f.job),
      total: favorites.length,
    };
  },

  // Đổi mật khẩu
  async changePassword(userId, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) {
      const error = new Error("Người dùng không tồn tại!");
      error.status = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      const error = new Error("Mật khẩu cũ không đúng!");
      error.status = 400;
      throw error;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { password: hashed },
    });

    return { message: "Đổi mật khẩu thành công!" };
  },
};
