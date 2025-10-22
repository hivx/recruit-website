// Chuyển BigInt -> string an toàn, không đụng vào kiểu khác
const toStr = (v) => (typeof v === "bigint" ? v.toString() : (v ?? null));

module.exports = { toStr };
