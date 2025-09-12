const path = require("path");
const multer = require("multer");

// Cấu hình lưu file avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu avatar
  },
  filename: (req, file, cb) => {
    // Đặt tên file: userId + timestamp + phần mở rộng
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, req.user?.userId + "_" + Date.now() + ext);
  },
});

const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép định dạng ảnh
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Chỉ cho phép tải lên ảnh (5MB và là jpg, jpeg, png, gif, webp)!",
        ),
      );
    }
  },
});

module.exports = uploadAvatar;
