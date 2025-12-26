// server/services/companyService.js
const prisma = require("../utils/prisma");
const { toCompanyDTO } = require("../utils/serializers/company");
const { shouldUpdate } = require("../utils/shouldUpdate");
const emailService = require("./emailService");

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

async function sendCompanyVerificationEmail({
  company,
  owner,
  status,
  reason,
}) {
  if (!owner?.email) {
    return;
  }

  const manageUrl = `${process.env.CLIENT_URL}/recruiter/company`;

  let subject;
  let html;

  if (status === "verified") {
    subject = "Công ty của bạn đã được xác thực";

    html = `
      <div style="font-family: Arial; line-height:1.6;">
        <p>Chào <b>${owner.name}</b>,</p>

        <p>
          Công ty <b>${company.legal_name}</b> đã được
          <b style="color:#16a34a;">xác thực thành công</b>.
        </p>

        <p>Bạn có thể đăng tin tuyển dụng và sử dụng đầy đủ chức năng.</p>

        <p style="margin:24px 0;">
          <a href="${manageUrl}" style="
            padding:10px 16px;
            background:#16a34a;
            color:#fff;
            text-decoration:none;
            border-radius:6px;
            font-weight:600;
          ">
            Quản lý thông tin công ty
          </a>
        </p>

        <p>Trân trọng,<br/><b>Recruitment System</b></p>
      </div>
    `;
  } else {
    subject = "Công ty chưa được xác thực – cần bổ sung thông tin";

    html = `
      <div style="font-family: Arial; line-height:1.6;">
        <p>Chào <b>${owner.name}</b>,</p>

        <p>
          Hồ sơ công ty <b>${company.legal_name}</b> hiện
          <b style="color:#dc2626;">chưa được xác thực</b>.
        </p>

        <p>Lý do:</p>

        <blockquote style="
          margin:16px 0;
          padding:12px 16px;
          background:#fef2f2;
          border-left:4px solid #dc2626;
        ">
          ${reason}
        </blockquote>

        <p>Vui lòng cập nhật và gửi lại để được xem xét.</p>

        <p style="margin:24px 0;">
          <a href="${manageUrl}" style="
            padding:10px 16px;
            background:#dc2626;
            color:#fff;
            text-decoration:none;
            border-radius:6px;
            font-weight:600;
          ">
            Cập nhật hồ sơ công ty
          </a>
        </p>

        <p>Trân trọng,<br/><b>Recruitment System</b></p>
      </div>
    `;
  }

  try {
    await emailService.sendEmail(owner.email, subject, html);
  } catch (e) {
    console.error("[Email Company Verify] send failed:", e?.message);
  }
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

  // ===== Lấy company + verification cũ + owner =====
  const company = await prisma.company.findUnique({
    where: { id: BigInt(companyId) },
    include: {
      verification: true,
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  if (!company) {
    const e = new Error("Không tìm thấy công ty.");
    e.status = 404;
    throw e;
  }

  // ===== IDENTITY CHECK (chặn gửi email trùng) =====
  const previousStatus = company.verification?.status;
  const nextStatus = action.status;
  const shouldSendEmail = previousStatus !== nextStatus;

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

  // ===== GỬI EMAIL CHO CHỦ CÔNG TY =====
  if (shouldSendEmail) {
    sendCompanyVerificationEmail({
      company,
      owner: company.owner,
      status: nextStatus,
      reason: action.reason,
    });
  }

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
