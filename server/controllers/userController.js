// controllers/userController.js
const bcrypt = require("bcrypt");

const userService = require("../services/userService");

exports.toggleFavoriteJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const jobId = req.params.jobId;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra job có trong favorites chưa
    const isFavorite = user.favorites.some(
      (fav) => fav.job_id === BigInt(jobId),
    );

    if (!isFavorite) {
      await userService.addFavoriteJob(userId, jobId);
      return res
        .status(200)
        .json({ message: "Đã thêm vào danh sách yêu thích" });
    } else {
      await userService.removeFavoriteJob(userId, jobId);
      return res
        .status(200)
        .json({ message: "Đã gỡ khỏi danh sách yêu thích" });
    }
  } catch (err) {
    console.error("[Favorite Job Error]", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// GET /api/users/favorites
exports.getFavoriteJobs = async (req, res) => {
  try {
    const favorites = await userService.getFavoriteJobs(req.user.userId);
    const jobs = favorites.map((fav) => fav.job); // lấy danh sách job từ quan hệ

    res.status(200).json(jobs);
  } catch (err) {
    console.error("[Get Favorite Jobs Error]", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// update user profile (name, email, avatar)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // từ JWT (tùy payload bạn set)

    // nếu có file upload (avatar) thì lấy path
    let avatarPath;
    if (req.file) {
      avatarPath = "uploads/" + req.file.filename;
    }

    const { name, email } = req.body;

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
    console.error("[Update Profile Error]", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId; // lấy từ token sau khi middleware decode
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
    }

    // Lấy user từ DB
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Hash mật khẩu mới
    const hashed = await bcrypt.hash(newPassword, 10);

    // Cập nhật
    await userService.updateUser(userId, { password: hashed });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("[Change Password Error]", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
