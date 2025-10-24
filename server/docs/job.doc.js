/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Quản lý bài đăng tuyển dụng (public & recruiter)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JobCompany:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1"
 *         legal_name:
 *           type: string
 *           example: "Công ty TNHH ABC Tech"
 *
 *     JobTagItem:
 *       type: object
 *       properties:
 *         jobId:
 *           type: string
 *           example: "12"
 *         tagId:
 *           type: integer
 *           example: 5
 *         tag:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 5
 *             name:
 *               type: string
 *               example: "Node.js"
 *
 *     JobApproval:
 *       type: object
 *       nullable: true
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: approved
 *         reason:
 *           type: string
 *           nullable: true
 *           example: "Mô tả chưa đầy đủ"
 *         auditor_id:
 *           type: string
 *           nullable: true
 *           example: "2"
 *         audited_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     Job:
 *       type: object
 *       description: Bản ghi công việc trả về từ API
 *       properties:
 *         id:
 *           type: string
 *           example: "12"
 *         title:
 *           type: string
 *           example: "Lập trình viên Backend Node.js"
 *         company_id:
 *           type: string
 *           example: "1"
 *         company:
 *           $ref: '#/components/schemas/JobCompany'
 *         created_by:
 *           type: string
 *           example: "4"
 *         created_by_name:
 *           type: string
 *           example: "Nguyễn Văn B"
 *         location:
 *           type: string
 *           example: "TP.HCM"
 *         description:
 *           type: string
 *           example: "Phát triển API cho hệ thống tuyển dụng"
 *         salary_min:
 *           type: number
 *           example: 15000000
 *         salary_max:
 *           type: number
 *           example: 25000000
 *         requirements:
 *           type: string
 *           example: "Có kinh nghiệm Node.js 2 năm trở lên"
 *         quality_score:
 *           type: number
 *           format: float
 *           example: 0
 *         application_count:
 *           type: integer
 *           example: 3
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         approval:
 *           $ref: '#/components/schemas/JobApproval'
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JobTagItem'
 *         # Các field dưới đây chỉ xuất hiện tùy trường hợp (khi controller bổ sung)
 *         createdAtFormatted:
 *           type: string
 *           example: "19/10/2025 10:30"
 *           description: "Chỉ có khi controller format thêm"
 *         isFavorite:
 *           type: boolean
 *           description: "Chỉ có khi người dùng đã đăng nhập"
 *
 *     JobCreateRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: "Lập trình viên Backend Node.js"
 *         company_id:
 *           type: string
 *           example: "1"
 *           description: "Có thể bỏ qua, hệ thống lấy từ công ty của recruiter"
 *         location:
 *           type: string
 *           example: "TP.HCM"
 *         description:
 *           type: string
 *           example: "Phát triển API cho hệ thống tuyển dụng"
 *         salary_min:
 *           type: number
 *           example: 15000000
 *         salary_max:
 *           type: number
 *           example: 25000000
 *         requirements:
 *           type: string
 *           example: "Kinh nghiệm Node.js 2 năm"
 *         tags:
 *           type: array
 *           example: ["Node.js", "Express", "MySQL"]
 *           items:
 *             type: string
 *
 *     JobUpdateRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/JobCreateRequest'
 *       description: "Cập nhật nội dung job (không cho đổi company_id qua API này)"
 *
 *     JobListResponse:
 *       type: object
 *       properties:
 *         jobs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Job'
 *         total:
 *           type: integer
 *           example: 48
 *         page:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 5
 *
 *     TagItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *         name:
 *           type: string
 *           example: "Node.js"
 *         jobCount:
 *           type: integer
 *           example: 12
 *
 *     PopularTagItem:
 *       type: object
 *       properties:
 *         tagId:
 *           type: integer
 *           example: 5
 *         tagName:
 *           type: string
 *           example: "Node.js"
 *         count:
 *           type: integer
 *           example: 20
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Danh sách job public (chỉ job đã được duyệt)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khoá tìm kiếm (tiêu đề, mô tả, yêu cầu, địa điểm, tên công ty)
 *       - in: query
 *         name: tag
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Lọc theo nhiều tag (ví dụ ?tag=Node.js&tag=React)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách job đã duyệt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobListResponse'
 */

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Chi tiết 1 job (chỉ hiển thị khi đã được duyệt)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin job
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       403:
 *         description: Công việc chưa được duyệt
 *       404:
 *         description: Không tìm thấy job
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Tạo job mới (recruiter có công ty đã xác thực)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobCreateRequest'
 *     responses:
 *       201:
 *         description: Tạo job thành công (approval mặc định là pending)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Thiếu company_id hoặc dữ liệu không hợp lệ
 *       403:
 *         description: Công ty chưa được xác thực / không đủ quyền
 */

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Cập nhật job (chủ job hoặc admin)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobUpdateRequest'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       403:
 *         description: Không có quyền sửa job này
 *       404:
 *         description: Không tìm thấy job
 */

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Xoá job (chủ job hoặc admin)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xoá thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa công việc thành công!"
 *       403:
 *         description: Không có quyền xoá
 *       404:
 *         description: Không tìm thấy job
 */

/**
 * @swagger
 * /api/jobs/tags:
 *   get:
 *     summary: Lấy tất cả tag đang được job sử dụng
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Danh sách tag + số lượng job đang dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TagItem'
 */

/**
 * @swagger
 * /api/jobs/popular-tags:
 *   get:
 *     summary: Top tag phổ biến (đếm theo số lượng job gắn tag)
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Top tag phổ biến
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PopularTagItem'
 */
