1) Mapping: API ↔ Bảng/Trường
Auth

POST /api/auth/register

users: name, email, password(hash), role, avatar="uploads/pic.jpg", isVerified=false.

Gửi email verify (JWT).

GET /api/auth/verify-email

users: set isVerified=true.

POST /api/auth/login

Không ghi DB.

GET /api/auth/me

Đọc users (+ companies.verification nếu có).

Company (recruiter)

POST /api/companies → companyService.createCompany

companies: owner_id, legal_name, registration_number, tax_id?, country_code, registered_address, incorporation_date?

company_verifications: auto status="submitted".

GET /api/companies/me: đọc companies (+ company_verifications).

PATCH /api/companies/me → updateMyCompany

Cập nhật các trường hợp lệ; bị chặn nếu verification.status="verified".

POST /api/companies/me/submit → submitForReview

company_verifications: upsert → status="submitted", reset rejection_reason, set submitted_at.

Bị chặn nếu status="verified".

Company (admin)

PATCH /api/companies/admin/:id/verify → verifyCompany

company_verifications: status="verified" → set verified_at, reviewed_by.

status="rejected" → set rejection_reason, clear verified_at.

Jobs

POST /api/jobs → jobService.createJob

jobs: title, company_id, created_by, created_by_name, location?, description?, salary_min?, salary_max?, requirements?

job_tags: if tags[] → connectOrCreate tags rồi create.

job_approvals: auto tạo status="pending".

GET /api/jobs (public, chỉ job approved)

jobs + join job_approvals(status="approved"), company, job_tags.

GET /api/jobs/:id

jobs + job_approvals (nếu status!="approved" → trả 403), company, creator, job_tags.

Nếu có req.user → ghi log hành vi (xem mục dưới).

PUT /api/jobs/:id → updateJob

Update các trường JD; không đổi company_id.

job_tags: nếu có tags[] → deleteMany rồi create lại từ tags đã upsert sẵn.

DELETE /api/jobs/:id → deleteJob

Transaction xóa: user_favorite_jobs, job_tags, applications, user_interest_history, job_recommendations, job_approvals, rồi jobs.

PATCH /api/jobs/:id/admin/approve → approveJob

job_approvals: upsert → status="approved", audited_at, auditor_id, reset reason.

Gửi email cho chủ job.

PATCH /api/jobs/:id/admin/reject → rejectJob

job_approvals: upsert → status="rejected", reason, audited_at, auditor_id.

Gửi email cho chủ job.

Applications

POST /api/applications → applicationService.createApplication

Validate: số ĐT, tồn tại job, (thiếu: job đã approved)

applications: job_id, applicant_id, cover_letter, cv, phone.

(Thiếu: tăng jobs.application_count).

Ghi log hành vi (dưới).

GET /api/applications/job/:jobId (recruiter/admin)

Đọc applications + applicant.

Favorites

POST /api/users/favorite/:jobId toggle

user_favorite_jobs: create hoặc delete.

Ghi log hành vi (dưới).

GET /api/users/favorite

Join user_favorite_jobs→jobs.

Hành vi (UserInterestHistory)

Đang được ghi ở:

getJobById (source=viewed, event=open_detail).

toggleFavoriteJob (source=favorite, event=add_favorite|remove_favorite).

createApplication (source=applied, event=apply_with_cv).

Bảng: user_interest_history: user_id, job_id, job_title, avg_salary?, tags(Json), source(enum), event_type, recorded_at.