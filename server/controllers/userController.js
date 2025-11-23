// controllers/userController.js
const fs = require("node:fs");
const path = require("node:path");

const authService = require("../services/authService");
const recruiterVectorService = require("../services/recruiterVectorService");
const userService = require("../services/userService");
const userVectorService = require("../services/userVectorService");

const { toUserDTO } = require("../utils/serializers/user"); // DTO

exports.toggleFavoriteJob = async (req, res) => {
  try {
    const result = await userService.toggleFavoriteJob(
      req.user.userId,
      req.params.jobId,
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("[Favorite Job Error]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi server!" });
  }
};

exports.getFavoriteJobs = async (req, res) => {
  try {
    const jobs = await userService.getFavoriteJobs(req.user.userId);
    res.status(200).json(jobs);
  } catch (err) {
    console.error("[Get Favorite Jobs Error]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi server!" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;
    const avatarFile = req.file;

    const updateData = await userService.validUpdateUser({
      userId,
      name,
      email,
      avatarFile,
    });

    // tách emailNew ra khỏi phần sẽ được update
    const { emailNew, ...userFields } = updateData;

    // 1) Cập nhật các field khác (KHÔNG cập nhật email)
    const updatedUser = await userService.updateUser(userId, userFields);

    // 2) Nếu user đổi email → gửi mail xác nhận đến email mới
    if (emailNew) {
      try {
        await authService.sendVerifyEmailChange(updatedUser, emailNew);
      } catch (e) {
        console.error("Gửi email xác nhận đổi email thất bại:", e.message);
      }
    }

    res.status(200).json({
      message: emailNew
        ? "Vui lòng kiểm tra email mới để xác nhận thay đổi."
        : "Cập nhật thông tin thành công",
      user: toUserDTO(updatedUser),
    });
  } catch (err) {
    console.error("[Update Profile Error]", err);

    // KHÔNG được bỏ đoạn này — rollback file upload nếu có lỗi
    if (req.file) {
      const failedFile = path.join(__dirname, "../uploads", req.file.filename);
      fs.unlink(failedFile, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Xóa file upload thất bại:", unlinkErr);
        }
      });
    }

    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi server!" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    // Check có đủ field
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới!" });
    }

    // Check mật khẩu tối thiểu 6 ký tự
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }

    const result = await userService.changePassword(
      req.user.userId,
      oldPassword,
      newPassword,
    );
    res.json(result);
  } catch (err) {
    console.error("[Change Password Error]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi server!" });
  }
};

// Build user vector
exports.rebuildUserVector = async (req, res) => {
  try {
    const vector = await userVectorService.buildUserVector(req.user.userId);

    res.json({
      message: "Vector user đã được cập nhật",
      vector,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.rebuildRecruiterVector = async (req, res) => {
  try {
    const { userId } = req.params;

    const vector = await recruiterVectorService.buildRecruiterVector(userId);

    return res.json({
      message: "Vector recruiter đã được cập nhật",
      vector: vector,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
};
