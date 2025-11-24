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

==========================================================================================================================
==========================================================================================================================

Giai đoạn 1 — Must-have (để đi production sớm)
1) Ứng tuyển (Application) – hoàn thiện vòng đời

Bạn đã có tạo đơn + liệt kê ứng viên theo job. Bổ sung:

GET /api/applications/me — danh sách đơn của chính ứng viên (service đã có getApplicationsByUser). Trả DTO gọn (job {id,title}, status, created_at, fit_score).

PATCH /api/applications/:id/status — chủ job/admin đổi trạng thái accepted|rejected + reason (optional) và gửi email cho ứng viên. (Có ApplicationStatus trong schema.)

GET /api/applications/:id/cv — trả file CV bằng signed URL/stream sau khi check quyền: chỉ chủ job, admin hoặc chính ứng viên mới tải. (Hiện đang lưu cv path.)

2) Công ty (Company) – công khai hồ sơ

Bạn đã có CRUD “công ty của tôi” + quy trình xét duyệt và admin verify. Bổ sung:

GET /api/companies — list công ty public (chỉ công ty verified) + tìm theo legal_name.

GET /api/companies/:id — trang hồ sơ công ty (thông tin cơ bản, trạng thái verify, tổng job).

GET /api/companies/:id/jobs — danh sách job đã approved thuộc công ty (phân trang).

3) Việc làm (Job) – lấp các khoảng trống phổ biến

Bạn có tạo job, xem chi tiết (cả owner draft), sửa/xoá, list approved, tag thống kê, admin duyệt/từ chối. Bổ sung:

GET /api/jobs/my — recruiter xem các job mình tạo (mọi trạng thái), kèm approval.status.

GET /api/jobs/company/:companyId — list job theo công ty (public: chỉ approved; owner/admin: cho phép draft).

GET /api/jobs/:id/related — gợi ý job tương tự dựa trên tag/location (top 5–10). Dễ làm bằng query tag overlap.

4) Kỹ năng & hồ sơ kỹ năng (Skill, UserSkill)

Schema đã có bảng skills và user_skills. Chưa có API:

GET /api/skills — list kỹ năng (dùng cho autocomplete).

POST /api/me/skills — thêm kỹ năng cá nhân: {skill_id|name, level, years, note}; connectOrCreate theo name.

PUT /api/me/skills/:skillId, DELETE /api/me/skills/:skillId — cập nhật/xoá 1 kỹ năng.

5) Sở thích nghề nghiệp ứng viên (CareerPreference)

Có bảng career_preferences + tag nối. API nên “1–1” theo user:

GET /api/me/career-preference — lấy.

PUT /api/me/career-preference — cập nhật các field + replace toàn bộ tags (chấp nhận mảng tags).

6) Tiêu chí tuyển dụng của NTD (RecruiterPreference)

Đã có recruiter_preferences + recruiter_required_skills + recruiter_preference_tags:

GET /api/me/recruiter-preference — lấy.

PUT /api/me/recruiter-preference — cập nhật base fields.

PUT /api/me/recruiter-preference/skills — thay toàn bộ danh sách requiredSkills (skill_id/years/must_have).

PUT /api/me/recruiter-preference/tags — thay toàn bộ desired tags.

7) Yêu thích (Favorites)

Bạn đã có POST toggle và GET list. Hoàn thiện thêm:

GET /api/jobs/:id/favorite — trả {isFavorite: boolean} (tiện FE render nút). (Bạn đã tính ở getJobById, có thể tách endpoint nhẹ).

Giai đoạn 2 — Should-have (tăng gắn kết & chất lượng)
8) Gợi ý việc làm (JobRecommendation)

Schema đã có bảng job_recommendations:

GET /api/recommendations — list gợi ý cho user hiện tại (lọc is_sent=false|all, sort recommended_at).

POST /api/recommendations/ack — đánh dấu đã gửi/đã xem (cập nhật is_sent, sent_at).

POST /api/recommendations/rebuild — (admin/internal) trigger rebuild offline (job queue) theo CareerPreference, UserBehaviorProfile, UserSkill + match với RecruiterPreference.

9) Hành vi người dùng (UserInterestHistory & BehaviorProfile)

Bạn đã có middleware logUserInterest được dùng trong services (view/apply/favorite). Bổ sung:

GET /api/me/activity — lịch sử hành vi (phân trang, filter source/event_type).

GET /api/me/behavior-profile — ảnh “hồ sơ hành vi” hiện tại; đây thường là field hệ thống tự cập nhật (không cần PUT public).

GET /api/admin/insights/tags — top tag theo hành vi (dựa user_interest_history), phục vụ dashboard.

10) Admin queue & báo cáo

GET /api/admin/company/reviews?status=submitted — hàng chờ verify công ty. (Bạn đã có PATCH verify).

GET /api/admin/job/reviews?status=pending — hàng chờ duyệt job (kèm creator & company). (Bạn đã có approve/reject).

GET /api/admin/metrics/overview — tổng hợp: số user, job (by status), application (by status), top tags. Dễ ghép bằng các count/groupBy.

11) Tìm kiếm & gợi ý UI

GET /api/search/suggestions?q= — gợi ý tag/kỹ năng/job/company (union 4 nguồn).

GET /api/tags & GET /api/jobs/popular-tags đã có; chỉ cần expose rõ trên FE.

Giai đoạn 3 — Nice-to-have / Platform polish

Thông báo (notifications): hiện dùng email (emailService). Có thể thêm in-app notifications sau, nhưng với MVP thì email + trang “Đơn của tôi” là đủ.

Bảo mật file: chuyển CV/Avatar sang signed URL (expirable) thay vì lộ path tĩnh. (Controller hiện join path trực tiếp.)

Rate limit + audit log: hạn chế spam apply/reset password; log admin actions (duyệt job/công ty).

Bộ lọc nâng cao cho /api/jobs: salary range, location exact/nearby, multi-tags AND/OR, sort theo application_count/updated_at. (Bạn đã có filter tag/search/paging.)

Ma trận quyền nhanh (trích yếu)

Applicant: browse jobs approved, apply, xem/cập nhật CareerPreference, quản lý UserSkill, favorites, xem “Đơn của tôi”, hoạt động & profile hành vi.

Recruiter: tạo/sửa/xoá job của mình (draft), xem applicants job của mình, quản lý RecruiterPreference, tạo & quản lý công ty 1-1, nộp xét duyệt.

Admin: duyệt/từ chối company & job, xem reports/queues/metrics, điều chỉnh status application khi cần.

Chuẩn DTO & validation (ngắn gọn)

DTO thuần: luôn convert BigInt → string; chỉ expose fields FE cần. Bạn đã làm tốt với toUserDTO, toJobDTO, toApplicationDTO. Duy trì pattern cho Company/Skill/Preference.

Validation:

Email @gmail.com (bạn đã enforce).

cover_letter bắt buộc khi apply; phone regex Việt Nam đơn giản (đã có).

Chặn duplicate apply; chặn sửa company đã verified; chặn đổi company_id của job sau khi tạo.