# Website tuyển dụng thông minh

## 1) Tổng quan dự án

### Mục tiêu dự án
Dự án xây dựng một nền tảng tuyển dụng với các chức năng chính: đăng tin tuyển dụng, quản lý ứng viên và hồ sơ, nộp đơn, theo dõi trạng thái ứng tuyển, và gợi ý việc làm dựa trên hành vi/ưu tiên.

### Đối tượng sử dụng
- **Ứng viên**: tài khoản mặc định có vai trò `applicant` (xem `server/prisma/schema.prisma`).
- **Recruiter (nhà tuyển dụng)**: thao tác đăng tin, quản lý công ty, xem ứng viên.
- **Admin (quản trị viên)**: duyệt job, duyệt công ty, quản trị hệ thống.

### Vai trò của backend và frontend
- **Backend (server/)**: cung cấp REST API, xử lý xác thực, logic nghiệp vụ, thao tác dữ liệu bằng Prisma/MySQL, xử lý recommendation/vector, cron job.
- **Frontend (client/)**: UI cho ứng viên/recruiter/admin, gọi API qua axios, quản lý state bằng Zustand/React Query, tổ chức màn hình và điều hướng.

---

## 2) Cấu trúc thư mục tổng thể

```text
.
├─ client/
│  ├─ public/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ assets/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ interfaces/
│  │  ├─ layouts/
│  │  ├─ pages/
│  │  ├─ providers/
│  │  ├─ routers/
│  │  ├─ services/
│  │  ├─ stores/
│  │  ├─ styles/
│  │  ├─ test/
│  │  ├─ types/
│  │  ├─ utils/
│  │  ├─ App.tsx
│  │  └─ main.tsx
│  └─ package.json
├─ server/
│  ├─ config/
│  ├─ controllers/
│  ├─ docs/
│  ├─ events/
│  ├─ middleware/
│  ├─ prisma/
│  ├─ routes/
│  ├─ services/
│  ├─ sql/
│  ├─ utils/
│  ├─ server.js
│  └─ package.json
├─ docs/
│  ├─ Analysis
│  ├─ Reports
|  └─ Diagrams
└─ README.md
```

---

## 3) Chi tiết các folder

### Backend (`server/`)

#### `server/server.js`
- **Chức năng**: entry-point của API Express.
- **Loại file**: khởi tạo server, middleware, routes, swagger, cron.
- **Trách nhiệm**: cấu hình app, đăng ký router, kết nối prisma và graceful shutdown.
#### `server/routes/`
- **Chức năng**: định nghĩa endpoint và middleware theo resource (auth, jobs, applications, ...).
- **Loại file**: Express Router.
- **Trách nhiệm**: map URL → controller, gắn middleware (auth/role/validation).

#### `server/controllers/`
- **Chức năng**: xử lý request/response và gọi service.
- **Loại file**: controller theo domain (`jobController`, `authController`, ...).
- **Trách nhiệm**: parse input, gọi service, trả HTTP status/JSON.

#### `server/services/`
- **Chức năng**: tầng nghiệp vụ chính.
- **Loại file**: service theo domain (`jobService`, `authService`, `recommendationService`, ...).
- **Trách nhiệm**: xử lý logic, thao tác Prisma/DB, gọi utils.

#### `server/middleware/`
- **Chức năng**: xác thực và phân quyền (`authMiddleware`, `roleMiddleware`, ...).
- **Loại file**: Express middleware.
- **Trách nhiệm**: kiểm tra token, quyền truy cập, yêu cầu recruiter đã có công ty xác thực.

#### `server/utils/`
- **Chức năng**: tiện ích dùng chung (token, prisma client, cron, serialize, ...).
- **Loại file**: helper, serializer, cấu hình.
- **Trách nhiệm**: tách các tiện ích tái sử dụng, chuẩn hóa dữ liệu.

#### `server/utils/serializers/`
- **Chức năng**: map/serialize dữ liệu trả về (job, user, application, ...).
- **Vai trò kiến trúc**: lớp chuyển đổi DTO/response.

#### `server/prisma/`
- **Chức năng**: schema & migrations Prisma (MySQL).
- **Loại file**: `schema.prisma`, migrations.
- **Trách nhiệm**: định nghĩa model, quan hệ, enum (role applicant/recruiter/admin).

#### `server/events/`
- **Chức năng**: event bus nội bộ (USER_BEHAVIOR_CHANGED, JOB_CHANGED...).
- **Loại file**: handlers + init.
- **Trách nhiệm**: khi dữ liệu thay đổi sẽ trigger rebuild vector/recommend.

#### `server/sql/`
- **Chức năng**: script SQL/migration phụ (ngoài Prisma).
- **Trách nhiệm**: lưu script tùy chỉnh (theo thư mục timestamp).
- **Lưu ý**: chỉ dùng khi cần chạy SQL thủ công.

#### `server/docs/`
- **Chức năng**: tài liệu nội bộ cho backend (swagger schema hỗ trợ từ `server/swagger.js`).

---

### Frontend (`client/`)

#### `client/src/main.tsx` & `client/src/App.tsx`
- **Chức năng**: entry-point React + root component.
- **Trách nhiệm**: mount app, cấu hình router/provider.

#### `client/src/routers/`
- **Chức năng**: định nghĩa route, guard (public/auth/protected).
- **Trách nhiệm**: phân chia tuyến theo vai trò (admin, recruiter, user).

#### `client/src/pages/`
- **Chức năng**: các màn hình chính (Home, JobDetail, Admin, Recruiter...).
- **Trách nhiệm**: kết hợp layout + component + hook.

#### `client/src/components/`
- **Chức năng**: UI tái sử dụng (general/admin/recruiter/profile...).
- **Trách nhiệm**: render UI dựa trên props/hook.

#### `client/src/api/`
- **Chức năng**: axios instance + interceptors.
- **Trách nhiệm**: attach token, xử lý lỗi toàn cục.
- **Flow**: `api.ts` là điểm gọi HTTP trung tâm.

#### `client/src/services/`
- **Chức năng**: lớp gọi API theo domain (job, auth, user...).
- **Trách nhiệm**: gọi `api`, map dữ liệu giữa client/server.

#### `client/src/hooks/`
- **Chức năng**: hooks dữ liệu (React Query) và logic nghiệp vụ phía client.
- **Trách nhiệm**: wrap service vào `useQuery/useMutation`, cache/invalidate.

#### `client/src/stores/`
- **Chức năng**: Zustand store (user, UI, filter, favorite...)
- **Trách nhiệm**: quản lý state toàn cục cho auth/UI/filter.

#### `client/src/types/` & `client/src/interfaces/`
- **Chức năng**: định nghĩa kiểu dữ liệu, mapping (VD: `mapJobRaw`).
- **Trách nhiệm**: đảm bảo type-safe và mapping DTO ↔ raw response.

#### `client/src/utils/`
- **Chức năng**: helper chung (toast, format, error handling...).

#### `client/src/providers/`
- **Chức năng**: wrapper provider (React Query, theme, ... nếu có).

#### `client/src/styles/` & `client/src/assets/`
- **Chức năng**: CSS/asset tĩnh.

#### `client/src/test/`
- **Chức năng**: nơi lưu code/test thử nghiệm (hiện tại không thấy test chạy qua script).

---

## 4) Luồng dữ liệu

### Backend
1. **Route** (`server/routes`) nhận request.
2. **Middleware** (`server/middleware`) kiểm tra auth/role.
3. **Controller** (`server/controllers`) parse input và gọi service.
4. **Service** (`server/services`) xử lý nghiệp vụ, gọi **Prisma** (`server/utils/prisma`).
5. **Serializer** (`server/utils/serializers`) chuẩn hóa dữ liệu trả về.
6. **Event** (`server/events`) phát sinh khi dữ liệu thay đổi (rebuild vector/recommendation).

### Frontend
1. **Component/Page** gọi **hook** (`client/src/hooks`).
2. Hook gọi **service** (`client/src/services`) → **api** (`client/src/api`).
3. **api** attach token, xử lý lỗi, trả dữ liệu.
4. **types/mappers** (`client/src/types`) map raw response thành UI model.
5. **stores** (`client/src/stores`) giữ state toàn cục (auth/filter).
