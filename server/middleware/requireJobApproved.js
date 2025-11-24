// middleware/requireJobApproved.js
const fs = require("node:fs");
const path = require("node:path");
const prisma = require("../utils/prisma");

module.exports = async function requireJobApproved(req, res, next) {
  try {
    // Hỗ trợ nhiều key: jobId, job_id, params.jobId, params.id, query.jobId
    const rawJobId =
      req.body?.jobId ??
      req.body?.job_id ??
      req.params?.jobId ??
      req.params?.id ??
      req.query?.jobId;

    if (!rawJobId) {
      return res.status(400).json({ message: "Thiếu jobId" });
    }
    // ép sang BigInt an toàn
    let jobId;
    try {
      jobId = BigInt(String(rawJobId));
    } catch {
      return res.status(400).json({ message: "jobId không hợp lệ" });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { approval: true },
    });
    if (!job) {
      // nếu có file upload rồi thì dọn (tuỳ chọn)
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          req.file.filename,
        );
        fs.unlink(filePath, () => {});
      }
      return res.status(404).json({ message: "Job không tồn tại" });
    }
    if (job.approval?.status !== "approved") {
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          req.file.filename,
        );
        fs.unlink(filePath, () => {});
      }
      return res.status(403).json({ message: "Job chưa được duyệt" });
    }

    req.job = job; // nếu controller cần
    next();
  } catch (e) {
    console.error("[requireJobApproved]", e);
    res.status(500).json({ message: "Lỗi kiểm tra trạng thái job" });
  }
};
