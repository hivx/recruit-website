// controllers/userController.js
const fs = require("node:fs");
const path = require("node:path");
const profileBuilder = require("../services/profileBuilderService");

const userService = require("../services/userService");

exports.toggleFavoriteJob = async (req, res) => {
  try {
    const result = await userService.toggleFavoriteJob(
      req.user.userId,
      req.params.jobId,
    );
    res.status(200).json(result);

    // sau khi toggle yêu thích xong
    setImmediate(async () => {
      try {
        const result = await profileBuilder.rebuildForUser(req.user.userId);
        console.log("[ProfileBuilder triggered after FAVORITE]", result);
      } catch (err) {
        console.warn("[Profile Rebuild after FAVORITE]", err.message);
      }
    });
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
    const avatarFile = req.file; // multer upload

    // Gọi service validate + xử lý avatar
    const updateData = await userService.validUpdateUser({
      userId,
      name,
      email,
      avatarFile,
    });

    // Cập nhật DB
    const updatedUser = await userService.updateUser(userId, updateData);

    res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    });
  } catch (err) {
    console.error("[Update Profile Error]", err);

    // Nếu file upload mà lỗi validation → xóa file mới
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
