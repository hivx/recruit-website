// services/userService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  //  Lấy thông tin user theo ID (kèm danh sách job yêu thích)
  async getUserById(userId) {
    try {
      return await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        include: {
          favorites: {
            include: {
              job: true, // nếu chỉ cần jobId => select: { job_id: true }
            },
          },
        },
      });
    } catch (err) {
      console.error('[UserService getUserById Error]', err.message);
      throw err;
    }
  },

  //  Cập nhật thông tin user
  async updateUser(userId, data) {
    try {
      return await prisma.user.update({
        where: { id: BigInt(userId) },
        data,
      });
    } catch (err) {
      console.error('[UserService updateUser Error]', err.message);
      throw err;
    }
  },

  //  Thêm job yêu thích (tránh trùng lặp)
  async addFavoriteJob(userId, jobId) {
    try {
      const exists = await prisma.userFavoriteJobs.findUnique({
        where: {
          user_id_job_id: {
            user_id: BigInt(userId),
            job_id: BigInt(jobId),
          },
        },
      });

      if (exists) return exists; // đã tồn tại thì trả luôn

      return await prisma.userFavoriteJobs.create({
        data: {
          user_id: BigInt(userId),
          job_id: BigInt(jobId),
        },
      });
    } catch (err) {
      console.error('[UserService addFavoriteJob Error]', err.message);
      throw err;
    }
  },

  //  Xóa job yêu thích
  async removeFavoriteJob(userId, jobId) {
    try {
      return await prisma.userFavoriteJobs.delete({
        where: {
          user_id_job_id: {
            user_id: BigInt(userId),
            job_id: BigInt(jobId),
          },
        },
      });
    } catch (err) {
      console.error('[UserService removeFavoriteJob Error]', err.message);
      throw err;
    }
  },

  //  Lấy danh sách job yêu thích của user
  async getFavoriteJobs(userId) {
    try {
      return await prisma.userFavoriteJobs.findMany({
        where: { user_id: BigInt(userId) },
        include: { job: true },
      });
    } catch (err) {
      console.error('[UserService getFavoriteJobs Error]', err.message);
      throw err;
    }
  },
};
