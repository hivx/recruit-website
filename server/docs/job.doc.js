/**
 * @swagger
 * tags:
 *   - name: Jobs
 *     description: API quản lý bài tuyển dụng
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: IT
 *
 *     JobTag:
 *       type: object
 *       properties:
 *         jobId:
 *           type: string
 *           example: "5"
 *         tagId:
 *           type: integer
 *           example: 1
 *         tag:
 *           $ref: '#/components/schemas/Tag'
 *
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "5"
 *         title:
 *           type: string
 *           example: Lập trình viên ReactJS
 *         company:
 *           type: string
 *           example: Công ty ABC
 *         location:
 *           type: string
 *           example: Hà Nội
 *         description:
 *           type: string
 *           example: Mô tả công việc ReactJS
 *         salary_min:
 *           type: number
 *           example: 15000000
 *         salary_max:
 *           type: number
 *           example: 20000000
 *         requirements:
 *           type: string
 *           example: Kinh nghiệm 1 năm ReactJS
 *         created_by:
 *           type: string
 *           example: "1"
 *         created_by_name:
 *           type: string
 *           example: Chu Văn Hiếu
 *           description: Tên người tạo bài viết, vẫn lưu ngay cả khi tài khoản bị xoá
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-06T15:33:52.927Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-06T15:33:52.927Z
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JobTag'
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Tạo bài tuyển dụng mới (chỉ recruiter hoặc admin)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - company
 *             properties:
 *               title:
 *                 type: string
 *                 example: Lập trình viên ReactJS
 *               company:
 *                 type: string
 *                 example: Công ty ABC
 *               location:
 *                 type: string
 *                 example: Hà Nội
 *               description:
 *                 type: string
 *                 example: Mô tả công việc ReactJS
 *               salary_min:
 *                 type: number
 *                 example: 15000000
 *               salary_max:
 *                 type: number
 *                 example: 20000000
 *               requirements:
 *                 type: string
 *                 example: Kinh nghiệm 1 năm ReactJS
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["IT", "Marketing"]
 *     responses:
 *       201:
 *         description: Bài tuyển dụng đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       401:
 *         description: Không có token, truy cập bị từ chối!
 *       403:
 *         description: Không có quyền thực hiện thao tác này!
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Lấy danh sách việc làm (có thể lọc theo tag, tìm kiếm, phân trang)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: "Lọc theo tag (VD: IT, Y tế, Marketing)"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Tìm kiếm theo từ khóa (VD: tiêu đề, công ty, mô tả)"
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
 *         description: Danh sách các bài tuyển dụng kèm phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 total:
 *                   type: integer
 *                   example: 1
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *       500:
 *         description: Lỗi server khi lấy danh sách việc làm!
 */

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Lấy chi tiết bài tuyển dụng theo ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của bài tuyển dụng
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết bài tuyển dụng
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Job'
 *                 - type: object
 *                   properties:
 *                     createdAtFormatted:
 *                       type: string
 *                       example: "01/09/2025 14:30"
 *                       description: Ngày giờ định dạng DD/MM/YYYY HH:mm
 *                     isFavorite:
 *                       type: boolean
 *                       description: Có được user login đánh dấu yêu thích không?
 *       404:
 *         description: Không tìm thấy việc làm cho ID này!
 */

/**
 * @swagger
 * /api/jobs/popular-tags:
 *   get:
 *     summary: Lấy các tag phổ biến nhất
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Danh sách tag phổ biến
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tag:
 *                     type: string
 *                   count:
 *                     type: integer
 */

/**
 * @swagger
 * /api/jobs/tags:
 *   get:
 *     summary: Lấy danh sách các lĩnh vực (tag) đang được sử dụng
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Trả về danh sách tag
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Cập nhật thông tin công việc theo ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Kỹ sư phần mềm ERP
 *               company:
 *                 type: string
 *                 example: Công ty IVIP
 *               location:
 *                 type: string
 *                 example: Thành phố Đà Nẵng
 *               description:
 *                 type: string
 *                 example: Công việc phát triển phần mềm ERP cần rất nhiều kỹ năng
 *               salary_min:
 *                 type: number
 *                 example: 10000000
 *               salary_max:
 *                 type: number
 *                 example: 35000000
 *               requirements:
 *                 type: string
 *                 example: Yêu cầu có kinh nghiệm với các hệ thống ERP
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["IT", "Kinh doanh"]
 *             required:
 *               - title
 *               - company
 *     responses:
 *       200:
 *         description: Cập nhật công việc thành công!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       403:
 *         description: Bạn không có quyền sửa công việc này!
 *       404:
 *         description: Không tìm thấy việc làm cho ID này!
 *       500:
 *         description: Lỗi server khi cập nhật công việc!
 */

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Xóa công việc theo ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa công việc thành công!
 *       403:
 *         description: Bạn không có quyền xóa công việc này!
 *       404:
 *         description: Không tìm thấy việc làm cho ID này!
 *       500:
 *         description: Lỗi server khi xóa công việc!
 */

/**
 * @swagger
 * tags:
 *   name: JobApproval
 *   description: Admin duyệt hoặc từ chối bài đăng tuyển dụng
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JobApprovalResponse:
 *       type: object
 *       properties:
 *         job_id:
 *           type: string
 *           example: "3"
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: approved
 *         reason:
 *           type: string
 *           nullable: true
 *           example: "Mô tả chưa đầy đủ"
 *         audited_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-19T09:15:00.000Z
 */

/**
 * @swagger
 * /api/jobs/admin/{id}/approve:
 *   patch:
 *     summary: Admin duyệt bài đăng tuyển dụng
 *     tags: [JobApproval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của job cần duyệt
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: approved
 *     responses:
 *       200:
 *         description: Duyệt job thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApprovalResponse'
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy job
 */

/**
 * @swagger
 * /api/jobs/admin/{id}/reject:
 *   patch:
 *     summary: Admin từ chối bài đăng tuyển dụng
 *     tags: [JobApproval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của job cần từ chối
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Mô tả công việc chưa rõ ràng."
 *     responses:
 *       200:
 *         description: Từ chối job thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApprovalResponse'
 *       404:
 *         description: Không tìm thấy job
 */
