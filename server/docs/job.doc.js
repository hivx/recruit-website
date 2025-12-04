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
 *     JobApproval:
 *       type: object
 *       description: Thông tin phê duyệt job (chỉ hiển thị cho admin)
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: "approved/rejected"
 *         reason:
 *           type: string
 *           nullable: true
 *           example: "Mô tả công việc chưa đầy đủ"
 *         audited_at:
 *           type: string
 *           format: date-time
 *           example: "2025-10-19T09:15:00.000Z"
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
 *     RequiredSkillItem:
 *       type: object
 *       description: Kỹ năng yêu cầu của công việc
 *       properties:
 *         skill_id:
 *           type: integer
 *           example: 1
 *         skill_name:
 *           type: string
 *           example: "ReactJS"
 *         level_required:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         years_required:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         must_have:
 *           type: boolean
 *           example: true
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
 *           example: "Hồ Chí Minh"
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
 *         requiredSkills:
 *           type: array
 *           description: Danh sách kỹ năng yêu cầu cho công việc
 *           items:
 *             $ref: '#/components/schemas/RequiredSkillItem'
 *         # Các field dưới đây chỉ xuất hiện tùy trường hợp (khi controller bổ sung)
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
 *           example: "Hồ Chí Minh"
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
 *         requiredSkills:
 *           type: array
 *           description: Danh sách kỹ năng yêu cầu
 *           example:
 *             - name: "ReactJS"
 *               level_required: 5
 *               years_required: 2
 *               must_have: true
 *             - name: "NodeJS"
 *               level_required: 3
 *               years_required: 1
 *               must_have: false
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "ReactJS"
 *               level_required:
 *                 type: integer
 *                 nullable: true
 *               years_required:
 *                 type: integer
 *                 nullable: true
 *               must_have:
 *                 type: boolean
 *
 *     JobUpdateRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/JobCreateRequest'
 *       description: "Cập nhật nội dung job (chỉ cập nhật các field được gửi lên, không bắt buộc gửi toàn bộ)"
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
 *     summary: Lấy danh sách job public (chỉ job đã được duyệt)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khoá tìm kiếm (tiêu đề, mô tả, yêu cầu, địa điểm, tên công ty)
 *
 *       - in: query
 *         name: tag
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Lọc theo nhiều tag (ví dụ ?tag=IT&tag=Sales)
 *
 *       - in: query
 *         name: location
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Lọc theo nhiều địa điểm (ví dụ ?location=HCM&location=HN)
 *
 *       - in: query
 *         name: salaryWanted
 *         schema:
 *           type: integer
 *         description: Mức lương mong muốn. Trả job có khoảng lương bao gồm giá trị này.
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *
 *     responses:
 *       200:
 *         description: Danh sách job đã duyệt theo điều kiện lọc & tìm kiếm
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

/**
 * @swagger
 * /api/jobs/vector/rebuild/{jobId}:
 *   post:
 *     summary: Sinh JobVector cho một công việc
 *     description:
 *       Tạo hoặc cập nhật vector của Job dựa trên job_required_skills, job_tags, salary_avg và location.
 *       API này được dùng sau khi tạo job hoặc khi cần cập nhật lại dữ liệu phục vụ hệ thống recommend.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID công việc cần build vector
 *     responses:
 *       200:
 *         description: JobVector đã được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vector job đã được cập nhật"
 *                 vector:
 *                   type: object
 *                   properties:
 *                     job_id:
 *                       type: string
 *                       example: "7"
 *                     skill_profile:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 12
 *                           weight:
 *                             type: number
 *                             example: 0.73
 *                           must:
 *                             type: boolean
 *                             example: true
 *                     tag_profile:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 17
 *                           weight:
 *                             type: number
 *                             example: 1
 *                     title_keywords:
 *                       type: array
 *                       nullable: true
 *                       example: null
 *                     location:
 *                       type: string
 *                       example: "HCM"
 *                     salary_avg:
 *                       type: integer
 *                       example: 18000000
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-16T16:02:38.624Z"
 *       400:
 *         description: Job không tồn tại hoặc chưa đủ dữ liệu để build vector
 *       403:
 *         description: Không có quyền thực hiện thao tác này
 *       500:
 *         description: Lỗi server khi build JobVector
 */

/**
 * @swagger
 * /api/jobs/my-jobs:
 *   get:
 *     summary: Lấy danh sách bài đăng thuộc về nhà tuyển dụng hiện tại
 *     description:
 *       Trả về danh sách job do chính người dùng hiện tại recruiter/admin tạo ra.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng job mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách job của nhà tuyển dụng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobListResponse'
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền (chỉ recruiter hoặc admin)
 */
