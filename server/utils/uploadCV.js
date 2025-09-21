const path = require("path");

const multer = require("multer");

// Cấu hình Multer để lưu tệp vào thư mục 'uploads/'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Chỉ định thư mục để lưu tệp
  },
  filename: (req, file, cb) => {
    // Đặt tên file là thời gian hiện tại + tên gốc của file
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadCV = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép tải lên các file PDF và DOCX
    const filetypes = /pdf|docx|doc/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype =
      filetypes.test(file.mimetype) || file.mimetype === "application/msword";

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép tải lên tệp PDF, DOC hoặc DOCX!"));
    }
  },
});

module.exports = uploadCV;
