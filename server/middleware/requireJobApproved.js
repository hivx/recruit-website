// middleware/requireJobApproved.js
const prisma = require("../utils/prisma");

module.exports = async function requireJobApproved(req, res, next) {
  try {
    const jobId = BigInt(req.params.id || req.body.job_id);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { approval: true },
    });
    if (!job) {
      return res.status(404).json({ message: "Job không tồn tại" });
    }
    if (job.approval?.status !== "approved") {
      return res.status(403).json({ message: "Job chưa được duyệt" });
    }
    // có thể gắn vào req nếu muốn
    req.job = job;
    next();
  } catch (e) {
    console.error("[requireJobApproved]", e.message);
    res.status(500).json({ message: "Lỗi kiểm tra trạng thái job" });
  }
};
