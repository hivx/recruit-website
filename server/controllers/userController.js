// controllers/userController.js
const userService = require("../services/userService");

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
    const avatarPath = req.file ? "uploads/" + req.file.filename : undefined;
    const { name, email } = req.body;

    if (email && !/\S+@gmail\.com$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Email phải có định dạng @gmail.com!" });
    }

    if (email) {
      const existingUser = await userService.getUserByEmail(email, userId);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email này đã được sử dụng bởi tài khoản khác!" });
      }
    }

    const updatedUser = await userService.updateUser(userId, {
      ...(name && { name }),
      ...(email && { email }),
      ...(avatarPath && { avatar: avatarPath }),
    });

    res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    });
  } catch (err) {
    console.error("[Update Profile Error]", err);
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
