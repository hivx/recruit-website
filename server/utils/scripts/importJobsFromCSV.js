// server/utils/scripts/importJobsFromCSV.js
const fs = require("node:fs");
const path = require("node:path");
const csv = require("csv-parser");
const prisma = require("../prisma");

// ===== CONFIG =====
const CSV_PATH = path.join(__dirname, "../data/jobs.csv");

async function importJobs() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error("Không tìm thấy file jobs.csv");
  }

  const rows = [];

  // 1. Đọc CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  if (!rows.length) {
    throw new Error("CSV không có dữ liệu");
  }

  console.log(`Đọc được ${rows.length} job`);

  const jobsToCreate = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const line = i + 2;

    // ===== Validate cơ bản =====
    if (!r.title || !r.company_registration_number || !r.recruiter_email) {
      console.warn(` Bỏ qua dòng ${line}: thiếu dữ liệu bắt buộc`);
      continue;
    }

    // ===== Tìm recruiter =====
    const recruiter = await prisma.user.findUnique({
      where: { email: r.recruiter_email.toLowerCase() },
      select: { id: true, name: true, role: true },
    });

    if (!recruiter || recruiter.role !== "recruiter") {
      console.warn(
        ` Bỏ qua dòng ${line}: recruiter không tồn tại hoặc sai role`,
      );
      continue;
    }

    // ===== Tìm company =====
    const company = await prisma.company.findUnique({
      where: {
        registration_number_country_code: {
          registration_number: r.company_registration_number,
          country_code: "VN",
        },
      },
      select: { id: true },
    });

    if (!company) {
      console.warn(` Bỏ qua dòng ${line}: không tìm thấy company`);
      continue;
    }

    // ===== Push job =====
    jobsToCreate.push({
      title: r.title.trim(),
      company_id: company.id,
      created_by: recruiter.id,
      created_by_name: recruiter.name,
      location: r.location || null,
      description: r.description || null,
      salary_min: r.salary_min ? Number(r.salary_min) : null,
      salary_max: r.salary_max ? Number(r.salary_max) : null,
      requirements: r.requirements || null,
    });
  }

  if (!jobsToCreate.length) {
    throw new Error("Không có job hợp lệ để import");
  }

  // 3. Insert
  const result = await prisma.job.createMany({
    data: jobsToCreate,
  });

  console.log(` Import thành công ${result.count} jobs`);
}

// ===== RUN =====
(async () => {
  try {
    await importJobs();
  } catch (err) {
    console.error("IMPORT JOB FAILED:", err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
