/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     CompanyVerification:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [submitted, verified, rejected]
 *           example: "verified"
 *         rejection_reason:
 *           type: string
 *           nullable: true
 *           example: "Thiếu giấy phép kinh doanh"
 *         submitted_at:
 *           type: string
 *           format: date-time
 *           example: "2025-10-18T17:00:49.174Z"
 *         verified_at:
 *           type: string
 *           format: date-time
 *           example: "2025-10-18T17:15:00.000Z"
 *         reviewed_by:
 *           type: string
 *           nullable: true
 *           example: "2"
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Nguyễn Văn Víp"
 *         email:
 *           type: string
 *           example: "nguyenvanb@gmail.com"
 *         role:
 *           type: string
 *           enum: [admin, recruiter, applicant]
 *           example: "applicant"
 *         isVerified:
 *           type: boolean
 *           example: true
 *         avatar:
 *           type: string
 *           example: "/uploads/avatars/1_1736625098123.png"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T10:20:30.000Z"
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
 *     tags: [Admin]
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
 *     tags: [Admin]
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

/**
 * @swagger
 * /api/companies/admin/{id}/verify:
 *   patch:
 *     summary: Admin phê duyệt hoặc từ chối công ty
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID công ty cần duyệt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [verified, rejected]
 *                 example: "verified"
 *               reason:
 *                 type: string
 *                 description: Lý do từ chối (bắt buộc nếu status = rejected)
 *                 example: "Thiếu giấy phép kinh doanh."
 *     responses:
 *       200:
 *         description: Kết quả duyệt công ty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company_id:
 *                   type: string
 *                   example: "1"
 *                 status:
 *                   type: string
 *                   example: "verified"
 *                 rejection_reason:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 verified_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-18T17:15:00.000Z"
 *       400:
 *         description: Trạng thái không hợp lệ hoặc thiếu lý do khi từ chối
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy công ty
 */

/**
 * @swagger
 * /api/users/admin/users:
 *   post:
 *     summary: (Admin) Tạo người dùng mới
 *     description: |
 *       API dành cho Admin tạo user nội bộ.
 *       User có thể được active/deactive ngay bằng isVerified.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admincreate@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [admin, recruiter, applicant]
 *                 example: "applicant"
 *               isVerified:
 *                 type: boolean
 *                 description: Dùng làm active/deactive
 *                 example: true
 *     responses:
 *       201:
 *         description: Tạo user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tạo user thành công"
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc email đã tồn tại
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không đủ quyền (Admin only)
 */

/**
 * @swagger
 * /api/users/admin/users:
 *   get:
 *     summary: (Admin) Lấy danh sách người dùng
 *     description: |
 *       API cho Admin quản lý danh sách user.
 *       Có thể filter theo role và trạng thái active (isVerified).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, recruiter, applicant]
 *         description: Lọc theo role
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái active/deactive
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: Danh sách user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserProfile'
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không đủ quyền (Admin only)
 */

/**
 * @swagger
 * /api/users/admin/users/{id}:
 *   put:
 *     summary: (Admin) Cập nhật thông tin người dùng
 *     description: |
 *       Admin cập nhật thông tin user:
 *       - Email
 *       - Tên
 *       - Role
 *       - Trạng thái active/deactive (isVerified)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "hahahavx@gmail.com"
 *               name:
 *                 type: string
 *                 example: "Nguyễn Văn B"
 *               role:
 *                 type: string
 *                 enum: [admin, recruiter, applicant]
 *                 example: "recruiter"
 *               isVerified:
 *                 type: boolean
 *                 description: Active / Deactive user
 *                 example: false
 *     responses:
 *       200:
 *         description: Cập nhật user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật user thành công"
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không đủ quyền (Admin only)
 *       404:
 *         description: Không tìm thấy người dùng
 */

/**
 * @swagger
 * /api/users/admin/users/{id}/status:
 *   patch:
 *     summary: (Admin) Kích hoạt hoặc vô hiệu hóa người dùng
 *     description: |
 *       Admin bật/tắt quyền đăng nhập của user.
 *       isActive = false → user không thể đăng nhập.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User đã bị vô hiệu hóa"
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: isActive không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không đủ quyền (Admin only)
 *       404:
 *         description: Không tìm thấy người dùng
 */

/**
 * @swagger
 * /api/users/admin/users/{id}:
 *   delete:
 *     summary: (Admin) Xóa người dùng
 *     description: |
 *       Chỉ cho phép xóa user chưa phát sinh dữ liệu
 *       (job, application, company, recommendation).
 *       Trường hợp khác phải deactive.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Xóa user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa user thành công"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Không thể xóa user đã phát sinh dữ liệu
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không đủ quyền (Admin only)
 *       404:
 *         description: Không tìm thấy người dùng
 */
