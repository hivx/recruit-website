// services/companyService.js
const prisma = require("../utils/prisma");
const { toCompanyDTO } = require("../utils/serializers/company");

/**
 * Recruiter tạo company (1-1). Sau khi tạo, tạo luôn CompanyVerification(status = submitted).
 */
async function createCompany(ownerId, payload) {
  // chặn nếu recruiter đã có company
  const existed = await prisma.company.findUnique({
    where: { owner_id: BigInt(ownerId) },
  });
  if (existed) {
    const e = new Error("Bạn đã có công ty. Không thể tạo thêm.");
    e.status = 409;
    throw e;
  }

  // chặn trùng mã ĐKKD + country
  const dup = await prisma.company.findFirst({
    where: {
      registration_number: payload.registration_number,
      country_code: payload.country_code,
    },
  });
  if (dup) {
    const e = new Error("registration_number đã tồn tại trong quốc gia này.");
    e.status = 409;
    throw e;
  }

  const company = await prisma.company.create({
    data: {
      owner_id: BigInt(ownerId),
      legal_name: payload.legal_name,
      registration_number: payload.registration_number,
      tax_id: payload.tax_id ?? null,
      country_code: payload.country_code,
      registered_address: payload.registered_address,
      incorporation_date: payload.incorporation_date
        ? new Date(payload.incorporation_date)
        : null,
      verification: {
        create: {
          status: "submitted", // theo schema đơn giản: submitted | verified | rejected
        },
      },
    },
    include: { verification: true },
  });

  return toCompanyDTO(company);
}

/**
 * Recruiter xem company của mình
 */
async function getMyCompany(ownerId) {
  const company = await prisma.company.findUnique({
    where: { owner_id: BigInt(ownerId) },
    include: { verification: true },
  });
  return toCompanyDTO(company);
}

/**
 * Recruiter cập nhật thông tin company của mình (chỉ khi chưa verified).
 * Nếu status hiện tại là rejected → cho sửa và sẽ tự chuyển về submitted nếu FE muốn “gửi xét duyệt lại”.
 * Ở đây chỉ cập nhật thông tin; nộp lại xét duyệt dùng submitForReview().
 */
async function updateMyCompany(ownerId, payload) {
  const company = await prisma.company.findUnique({
    where: { owner_id: BigInt(ownerId) },
    include: { verification: true },
  });
  if (!company) {
    const e = new Error("Bạn chưa có công ty.");
    e.status = 404;
    throw e;
  }
  if (company.verification?.status === "verified") {
    const e = new Error("Công ty đã được xác thực, không thể chỉnh sửa.");
    e.status = 403;
    throw e;
  }

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: {
      legal_name: payload.legal_name ?? company.legal_name,
      registration_number:
        payload.registration_number ?? company.registration_number,
      tax_id: payload.tax_id ?? company.tax_id,
      country_code: payload.country_code ?? company.country_code,
      registered_address:
        payload.registered_address ?? company.registered_address,
      incorporation_date: payload.incorporation_date
        ? new Date(payload.incorporation_date)
        : company.incorporation_date,
    },
    include: { verification: true },
  });

  return toCompanyDTO(updated);
}

/**
 * Recruiter nộp lại xét duyệt (submitted lại), reset lý do từ chối.
 */
async function submitForReview(ownerId) {
  const company = await prisma.company.findUnique({
    where: { owner_id: BigInt(ownerId) },
    include: { verification: true },
  });
  if (!company) {
    const e = new Error("Bạn chưa có công ty.");
    e.status = 404;
    throw e;
  }
  // chặn nộp lại nếu đã verified
  if (company.verification?.status === "verified") {
    const e = new Error(
      "Công ty đã được xác thực, không thể nộp lại xét duyệt.",
    );
    e.status = 403;
    throw e;
  }

  const ver = await prisma.companyVerification.upsert({
    where: { company_id: company.id },
    update: {
      status: "submitted",
      rejection_reason: null,
      submitted_at: new Date(),
      verified_at: null,
      reviewed_by: null,
    },
    create: {
      company_id: company.id,
      status: "submitted",
    },
  });

  return {
    company_id: company.id.toString(),
    status: ver.status,
    submitted_at: ver.submitted_at,
  };
}

/**
 * ADMIN: phê duyệt công ty (verified) hoặc từ chối (rejected + reason).
 */
async function verifyCompany(companyId, adminId, action) {
  // action: { status: 'verified' | 'rejected', reason?: string }
  if (!["verified", "rejected"].includes(action.status)) {
    const e = new Error("Trạng thái không hợp lệ.");
    e.status = 400;
    throw e;
  }
  if (action.status === "rejected" && !action.reason) {
    const e = new Error("Vui lòng nhập lý do từ chối.");
    e.status = 400;
    throw e;
  }

  // tồn tại company?
  const company = await prisma.company.findUnique({
    where: { id: BigInt(companyId) },
  });
  if (!company) {
    const e = new Error("Không tìm thấy công ty.");
    e.status = 404;
    throw e;
  }

  const updated = await prisma.companyVerification.upsert({
    where: { company_id: company.id },
    update: {
      status: action.status,
      rejection_reason: action.status === "rejected" ? action.reason : null,
      verified_at: action.status === "verified" ? new Date() : null,
      reviewed_by: BigInt(adminId),
    },
    create: {
      company_id: company.id,
      status: action.status,
      rejection_reason: action.status === "rejected" ? action.reason : null,
      verified_at: action.status === "verified" ? new Date() : null,
      reviewed_by: BigInt(adminId),
    },
  });

  return {
    company_id: company.id.toString(),
    status: updated.status,
    rejection_reason: updated.rejection_reason || null,
    verified_at: updated.verified_at,
    reviewed_by: updated.reviewed_by ? updated.reviewed_by.toString() : null,
  };
}

module.exports = {
  createCompany,
  getMyCompany,
  updateMyCompany,
  submitForReview,
  verifyCompany,
};
