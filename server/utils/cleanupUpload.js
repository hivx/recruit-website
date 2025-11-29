const fs = require("node:fs");
const path = require("node:path");

function cleanupUploadedFile(req) {
  if (req.file) {
    const filePath = path.join(__dirname, "../uploads/", req.file.filename);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Xóa file upload thất bại:", err);
      }
    });
  }
}

module.exports = { cleanupUploadedFile };
