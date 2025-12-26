//server/utils/thrErrors.js
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status; // luôn dùng 1 thuộc tính duy nhất
  }
}

module.exports = AppError;
