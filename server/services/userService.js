// server/services/userService.js
const fs = require("node:fs");
const path = require("node:path");

const bcrypt = require("bcrypt");

const { logUserInterest } = require("../middleware/logUserInterest");
const prisma = require("../utils/prisma");
const { toJobDTO } = require("../utils/serializers/job");
const emailService = require("./emailService");

module.exports = {
  // async getUserById(userId) {
  //   return prisma.user.findUnique({
  //     where: { id: BigInt(userId) },
  //     include: {
  //       favorites: { include: { job: true } },
  //     },
  //   });
  // },

  async updateUser(userId, data) {
    return prisma.user.update({
      where: { id: BigInt(userId) },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.avatar && { avatar: data.avatar }),
      },
    });
  },

  // Hàm validate và xử lý update (bao gồm avatar)
  async validUpdateUser({ userId, name, email, avatarFile }) {
    // Lấy user hiện tại
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) {
      const error = new Error("Người dùng không tồn tại!");
      error.status = 404;
      throw error;
    }

    // ==========================
    // 1. Validate email nếu có
    // ==========================
    let shouldResetVerify = false;

    if (email) {
      // Kiểm tra định dạng
      if (!email.endsWith("@gmail.com")) {
        const error = new Error("Email phải có định dạng @gmail.com!");
        error.status = 400;
        throw error;
      }

      // Kiểm tra email đã dùng bởi user khác chưa
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: BigInt(userId) },
        },
      });
      if (existingUser) {
        const error = new Error("Email này đã được sử dụng!");
        error.status = 400;
        throw error;
      }

      // Email thay đổi → reset verify
      if (email !== user.email) {
        shouldResetVerify = true;
      }
    }

    // ==========================
    // 2. Xử lý upload avatar
    // ==========================
    let avatarPath;

    if (avatarFile) {
      avatarPath = "uploads/" + avatarFile.filename;

      // Xóa avatar cũ nếu không phải default
      if (user.avatar && user.avatar !== "uploads/pic.jpg") {
        const oldAvatar = path.join(__dirname, "../", user.avatar);
        fs.unlink(oldAvatar, (err) => {
          if (err) {
            console.error("Xóa avatar cũ thất bại:", err);
          }
        });
      }
    }

    // ==========================
    // 3. Trả dữ liệu để controller update
    // ==========================
    return {
      name,
      avatar: avatarPath,
      emailNew: shouldResetVerify ? email : null,
    };
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
    // Kiểm tra job tồn tại và được duyệt chưa
    const job = await prisma.job.findFirst({
      where: {
        id: BigInt(jobId),
        approval: {
          is: { status: "approved" },
        }, // lọc luôn job đã duyệt
      },
      include: {
        approval: { select: { status: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!job) {
      const error = new Error(
        "Không tìm thấy công việc hoặc công việc chưa được duyệt!",
      );
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

    // Nếu đã có → gỡ khỏi danh sách
    if (exists) {
      await prisma.userFavoriteJobs.delete({
        where: {
          user_id_job_id: {
            user_id: BigInt(userId),
            job_id: BigInt(jobId),
          },
        },
      });

      //  Ghi log hành vi “remove_favorite”
      logUserInterest({
        userId,
        job,
        source: "favorite",
        eventType: "remove_favorite",
      });

      return { message: "Đã gỡ khỏi danh sách yêu thích" };
    }

    // Nếu chưa có → thêm mới
    await prisma.userFavoriteJobs.create({
      data: {
        user_id: BigInt(userId),
        job_id: BigInt(jobId),
      },
    });

    //  Ghi log hành vi “add_favorite”
    logUserInterest({
      userId,
      job,
      source: "favorite",
      eventType: "add_favorite",
    });

    return { message: "Đã thêm vào danh sách yêu thích" };
  },

  async getFavoriteJobs(userId) {
    const favorites = await prisma.userFavoriteJobs.findMany({
      where: { user_id: BigInt(userId) },
      include: {
        job: {
          include: {
            approval: true,
            tags: { include: { tag: true } },
            company: { select: { id: true, legal_name: true } },
            requiredSkills: {
              include: { skill: true }, // Bổ sung skill của job
            },
          },
        },
      },
    });

    const jobs = favorites.filter((f) => !!f.job).map((f) => toJobDTO(f.job));
    return { jobs, total: jobs.length };
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

  async adminCreateUser({ name, email, password, role, isVerified = true }) {
    // 1. Validate cơ bản
    if (!name || !email || !password) {
      const err = new Error("Thiếu thông tin bắt buộc!");
      err.status = 400;
      throw err;
    }

    // 2. Check email trùng
    const exists = await prisma.user.findUnique({
      where: { email },
    });
    if (exists) {
      const err = new Error("Email đã tồn tại!");
      err.status = 400;
      throw err;
    }

    // 3. Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 4. Create user
    return prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashed,
        role: role || "applicant",
        isVerified: Boolean(isVerified), // dùng làm active
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        created_at: true,
      },
    });
  },

  // Admin update user
  async adminUpdateUser(userId, data) {
    const uid = BigInt(userId);

    const user = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (!user) {
      const err = new Error("Người dùng không tồn tại!");
      err.status = 404;
      throw err;
    }

    const update = {};
    const changedFields = [];

    if (data.email && data.email.trim() !== user.email) {
      update.email = data.email.trim();
      changedFields.push("email");
    }

    if (data.name && data.name.trim() !== user.name) {
      update.name = data.name.trim();
      changedFields.push("name");
    }

    if (data.role && data.role !== user.role) {
      update.role = data.role;
      changedFields.push("role");
    }

    if (typeof data.isVerified === "boolean") {
      update.isVerified = data.isVerified;
      changedFields.push("isVerified");
    }

    // Không có gì thay đổi → update vẫn chạy (hoặc có thể return sớm)
    const updated = await prisma.user.update({
      where: { id: uid },
      data: update,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        updated_at: true,
      },
    });

    // ===== GỬI EMAIL THÔNG BÁO THAY ĐỔI THÔNG TIN =====
    if (changedFields.length > 0 && user.email) {
      try {
        const subject = "Thông tin tài khoản của bạn đã được cập nhật";

        const fieldLabels = {
          email: "Email",
          name: "Tên hiển thị",
          role: "Vai trò tài khoản",
          isVerified: "Trạng thái tài khoản",
        };

        const html = `
          <div style="font-family: Arial; line-height:1.6; color:#111;">
            <p>Chào <b>${user.name || "bạn"}</b>,</p>

            <p>
              Quản trị viên đã cập nhật một số thông tin trong tài khoản của bạn.
            </p>

            <ul>
              ${changedFields
                .map(
                  (f) => `<li><b>${fieldLabels[f]}</b> đã được thay đổi</li>`,
                )
                .join("")}
            </ul>

            <p>
              Nếu bạn không nhận ra thay đổi này hoặc có thắc mắc,
              vui lòng liên hệ với bộ phận quản trị để được hỗ trợ.
            </p>

            <p style="margin-top:24px;">
              Trân trọng,<br/>
              <b>Recruitment System</b>
            </p>
          </div>
        `;

        await emailService.sendEmail(user.email, subject, html);
      } catch (e) {
        console.error("[Email User Update] send failed:", e?.message);
        // không throw
      }
    }

    return updated;
  },

  // Admin active / deactive user
  async adminSetUserActive(userId, isActive) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: { id: true, name: true, email: true, isVerified: true },
    });

    if (!user) {
      const e = new Error("Không tìm thấy người dùng.");
      e.status = 404;
      throw e;
    }

    const nextIsVerified = Boolean(isActive);
    const shouldSendEmail = user.isVerified !== nextIsVerified;

    const updated = await this.adminUpdateUser(userId, {
      isVerified: nextIsVerified,
    });

    // ===== GỬI EMAIL (GỘP LUÔN) =====
    if (shouldSendEmail && user.email) {
      try {
        const subject = nextIsVerified
          ? "Tài khoản của bạn đã được kích hoạt"
          : "Tài khoản của bạn đã bị vô hiệu hóa";

        const html = nextIsVerified
          ? `
            <div style="font-family: Arial; line-height:1.6;">
              <p>Chào <b>${user.name || "bạn"}</b>,</p>

              <p>
                Tài khoản của bạn đã được
                <b style="color:#16a34a;">kích hoạt</b>.
              </p>

              <p>
                Bạn hiện có thể đăng nhập và sử dụng các chức năng của hệ thống.
              </p>

              <p style="margin:24px 0;">
                <a href="${process.env.CLIENT_URL}/login"
                  style="
                    padding:10px 16px;
                    background:#16a34a;
                    color:#fff;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:600;
                  ">
                  Đăng nhập hệ thống
                </a>
              </p>

              <p>Trân trọng,<br/><b>Recruitment System</b></p>
            </div>
          `
          : `
            <div style="font-family: Arial; line-height:1.6;">
              <p>Chào <b>${user.name || "bạn"}</b>,</p>

              <p>
                Tài khoản của bạn hiện
                <b style="color:#dc2626;">đã bị vô hiệu hóa</b>.
              </p>

              <p>
                Nếu bạn muốn muốn khiếu nại hoặc cần hỗ trợ,
                vui lòng liên hệ với quản trị viên của hệ thống.
              </p>

              <p>Trân trọng,<br/><b>Recruitment System</b></p>
            </div>
          `;

        await emailService.sendEmail(user.email, subject, html);
      } catch (e) {
        console.error("[Email User Active] send failed:", e?.message);
        // không throw
      }
    }

    return updated;
  },

  // Admin list users
  async adminListUsers({ role, isVerified, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (role) {
      where.role = role;
    }
    if (typeof isVerified === "boolean") {
      where.isVerified = isVerified;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          created_at: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Admin delete user
  async adminDeleteUser(userId) {
    const uid = BigInt(userId);

    const user = await prisma.user.findUnique({
      where: { id: uid },
      include: {
        jobs: { take: 1 },
        applications: { take: 1 },
        company: true,
        recommendations: { take: 1 },
      },
    });

    if (!user) {
      const err = new Error("Người dùng không tồn tại!");
      err.status = 404;
      throw err;
    }

    if (
      user.jobs.length ||
      user.applications.length ||
      user.company ||
      user.recommendations.length
    ) {
      const err = new Error(
        "Không thể xoá user đã phát sinh dữ liệu. Hãy deactive thay vì xoá.",
      );
      err.status = 400;
      throw err;
    }

    await prisma.user.delete({
      where: { id: uid },
    });

    return { success: true };
  },

  // Update receive recommendation
  async updateReceiveRecommendation(userId, receiveRecommendation) {
    return prisma.user.update({
      where: { id: BigInt(userId) },
      data: { receive_recommendation: receiveRecommendation },
    });
  },
};
