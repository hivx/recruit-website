// server/services/companyService.js
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
      logo: payload.logo ?? null,
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

  // ======== SHOULD UPDATE LOGIC ========
  const shouldUpdate = (v) =>
    !(
      v === undefined ||
      v === null ||
      (typeof v === "string" && v.trim() === "")
    );

  // ======== XÂY DATA UPDATE AN TOÀN ========
  const dataToUpdate = {};

  if (shouldUpdate(payload.legal_name)) {
    dataToUpdate.legal_name = payload.legal_name;
  }
  if (shouldUpdate(payload.registration_number)) {
    dataToUpdate.registration_number = payload.registration_number;
  }
  if (shouldUpdate(payload.tax_id)) {
    dataToUpdate.tax_id = payload.tax_id;
  }
  if (shouldUpdate(payload.country_code)) {
    dataToUpdate.country_code = payload.country_code;
  }
  if (shouldUpdate(payload.registered_address)) {
    dataToUpdate.registered_address = payload.registered_address;
  }
  if (shouldUpdate(payload.incorporation_date)) {
    dataToUpdate.incorporation_date = new Date(payload.incorporation_date);
  }
  if (shouldUpdate(payload.logo)) {
    dataToUpdate.logo = payload.logo;
  }

  // ======== CHECK DUPLICATE COMPANY ID IF USER UPDATE registration_number COUNTRY_CODE ========
  if (
    (payload.registration_number !== undefined &&
      payload.registration_number !== "") ||
    (payload.country_code !== undefined && payload.country_code !== "")
  ) {
    const newReg = payload.registration_number || company.registration_number;
    const newCountry = payload.country_code || company.country_code;

    const dup = await prisma.company.findFirst({
      where: {
        registration_number: newReg,
        country_code: newCountry,
        NOT: { id: company.id },
      },
    });

    if (dup) {
      const e = new Error("Registration_number đã tồn tại trong quốc gia này.");
      e.status = 409;
      throw e;
    }
  }

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: dataToUpdate,
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

/**
 * ADMIN: Lấy danh sách tất cả công ty.
 */
async function listCompanies({ page, limit }) {
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.company.findMany({
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        verification: true,
      },
    }),
    prisma.company.count(),
  ]);

  return {
    companies: rows.map(toCompanyDTO),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Lấy thông tin chi tiết của 1 công ty.
 */
async function getCompanyDetail(companyId) {
  const company = await prisma.company.findUnique({
    where: { id: BigInt(companyId) },
    include: {
      verification: true,
    },
  });

  return toCompanyDTO(company);
}

module.exports = {
  createCompany,
  getMyCompany,
  updateMyCompany,
  submitForReview,
  verifyCompany,
  listCompanies,
  getCompanyDetail,
};
