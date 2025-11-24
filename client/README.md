SITEMAP & ROUTES (FE)

/                      -> Home (danh sách job, filter, pagination)
/jobs/:id              -> Job Detail
/jobs/:id/apply        -> Apply Job (applicant)
/favorites             -> Favorite Jobs (applicant)
/auth/login            -> Login
/auth/register         -> Register

/recruiter/dashboard   -> Recruiter Dashboard (bảo vệ bởi role)
/recruiter/jobs        -> My Jobs (list)
/recruiter/jobs/new    -> Create Job
/recruiter/jobs/:id/edit -> Edit Job
/recruiter/jobs/:id/applications -> Applications for a Job

/admin (để sau nếu cần)

** nhớ cài thêm cái gì mà chuyển src/ thành @/

1) Vai trò & mục tiêu
Roles: guest, applicant, recruiter, admin.

Mục tiêu v1: tìm việc, xem chi tiết, ứng tuyển (upload CV), yêu thích; recruiter đăng/sửa/xóa job, xem ứng viên.

2) SITEMAP & ROUTES (FE)

/                      -> Home (danh sách job, filter, pagination)
/jobs/:id              -> Job Detail
/jobs/:id/apply        -> Apply Job (applicant)
/favorites             -> Favorite Jobs (applicant)
/auth/login            -> Login
/auth/register         -> Register

/recruiter/dashboard   -> Recruiter Dashboard (bảo vệ bởi role)
/recruiter/jobs        -> My Jobs (list)
/recruiter/jobs/new    -> Create Job
/recruiter/jobs/:id/edit -> Edit Job
/recruiter/jobs/:id/applications -> Applications for a Job

/admin (để sau nếu cần)
3) Quy ước URL query cho danh sách job

/?search=react+node
  &tags=frontend,remote           // CSV
  &location=Hanoi                 // optional
  &minSalary=15000000&maxSalary=30000000  // optional
  &sort=createdAt_desc            // createdAt_desc|salary_desc|salary_asc
  &page=1&limit=20
4) Hợp đồng dữ liệu (TypeScript types)
4.1 Job (FE model)

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;            // hoặc number nếu BE đã chuẩn
  requirements?: string;
  tags: string[];
  createdBy: string;          // userId
  createdByName: string;
  createdAt: string;          // ISO
  updatedAt?: string;         // ISO
  isFavorite?: boolean;       // phụ thuộc token
}
4.2 Application

export interface Application {
  _id: string;
  job: string;               // jobId
  applicant: string;         // userId
  applicantName?: string;
  email?: string;
  phone?: string;
  coverLetter?: string;
  cv?: string;               // URL/Path
  createdAt: string;
}
4.3 User (tối thiểu cho FE)

export type UserRole = 'admin' | 'recruiter' | 'applicant';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}
4.4 API response chuẩn (gợi ý)
Danh sách có phân trang


export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;         // tổng bản ghi
}
Lỗi chuẩn


export interface ApiError {
  message: string;
  code?: string;         // e.g., 'UNAUTHORIZED', 'VALIDATION_ERROR'
  details?: Record<string, string>; // field-level errors
}
5) ENDPOINTS & PAYLOADS (đồng bộ với BE hiện có)
5.1 Jobs
GET /api/jobs

Query: search, tags, location, minSalary, maxSalary, sort, page, limit

Res: Paginated<Job> hoặc Job[] (chốt 1 kiểu; khuyến nghị Paginated)

GET /api/jobs/:id

Res: Job

POST /api/jobs (recruiter/admin)

Body (min):

{
  "title": "", "company": "", "location": "",
  "description": "", "salary": "", "requirements": "",
  "tags": ["frontend","remote"]
}
Res: Job

PUT /api/jobs/:id (owner/admin)

Body: partial fields

Res: Job

DELETE /api/jobs/:id (owner/admin)

Res: { success: true }

5.2 Favorites (applicant)
POST /api/users/favorite/:jobId → Res: { success: true }

GET /api/users/favorite → Res: Job[] hoặc Paginated<Job>

5.3 Applications
POST /api/applications (multipart nếu có CV)

Body:


job: string
coverLetter?: string
phone?: string
cv?: File
Res: Application

GET /api/applications/job/:jobId (recruiter/admin)

Res: Application[] hoặc Paginated<Application>

5.4 Auth
POST /api/auth/login → Res: { token: string, user: User }

POST /api/auth/register → Res: { token: string, user: User }

GET /api/auth/me → Res: User

6) Quy ước lưu trữ & trạng thái FE
Auth token: localStorage["token"]

User cache: localStorage["user"] (hoặc fetch /auth/me trên app load)

Axios Interceptor: gắn Authorization: Bearer <token> nếu có.

Error handling: chụp ApiError và hiển thị toast/alert.

7) Kiến trúc màn hình & component
7.1 Home (Job list)
UI Blocks: SearchBar, TagFilter, SortSelect, JobCard grid, Pagination

Data: gọi GET /api/jobs theo query trên URL (đồng bộ useSearchParams)

Actions: click JobCard → /jobs/:id, toggle favorite (nếu đã login)

7.2 Job Detail
UI: title/company/location/salary/tags/description, nút Apply, nút Favorite

Actions: Apply → /jobs/:id/apply

7.3 Apply
UI: form coverLetter, phone, upload cv

Submit: POST /api/applications

7.4 Favorites
hiển thị danh sách từ GET /api/users/favorite

7.5 Recruiter
Dashboard: số job, số ứng viên gần đây

My Jobs: list + CRUD

Applications for Job: bảng ứng viên theo job

8) Cấu trúc mã nguồn (map vào folders đã tạo)

src/
  components/
    JobCard.tsx
    SearchBar.tsx
    TagFilter.tsx
    SortSelect.tsx
    Pagination.tsx
    Header.tsx
    Footer.tsx
  layouts/
    DefaultLayout.tsx
  pages/
    Home.tsx
    JobDetail.tsx
    ApplyJob.tsx
    Favorites.tsx
    Login.tsx
    Register.tsx
    recruiter/
      Dashboard.tsx
      MyJobs.tsx
      JobForm.tsx
      JobApplications.tsx
  router/
    index.tsx
    guards.tsx               // Route guards theo role
  services/
    axiosClient.ts
    jobApi.ts
    applicationApi.ts
    authApi.ts
    favoriteApi.ts
  types/
    job.ts
    application.ts
    user.ts
    api.ts                   // Paginated, ApiError
  utils/
    format.ts                // formatDate, money, etc.
9) Nguyên tắc UI/UX & Tailwind v4 (ngắn gọn)
Tailwind v4 “zero‑config”: giữ @tailwind base; @tailwind components; @tailwind utilities;

Quy ước spacing (px-4, py-6), container (max-w-6xl mx-auto), grid responsive.

Nút & input thống nhất class để tái dùng.

Bước tiếp theo (thực thi)
Khởi tạo router & route trống tương ứng sitemap (render placeholder).

Khai báo toàn bộ types: job.ts, application.ts, user.ts, api.ts.

Tạo axiosClient.ts + interceptors.

Tạo Header/Footer + DefaultLayout để ráp khung.