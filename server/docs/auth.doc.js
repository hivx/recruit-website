/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Quản lý xác thực (đăng ký, đăng nhập, xác thực người dùng)
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           example: Nguyễn Văn A
 *         email:
 *           type: string
 *           format: email
 *           example: chuvanhieu357@gmail.com
 *         password:
 *           type: string
 *           format: password
 *           example: 123456
 *         role:
 *           type: string
 *           enum: [admin, recruiter, applicant]
 *           example: applicant
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: chuvanhieu357@gmail.com
 *         password:
 *           type: string
 *           format: password
 *           example: 123456
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Nguyễn Văn A
 *         email:
 *           type: string
 *           example: chuvanhieu357@gmail.com
 *         role:
 *           type: string
 *           enum: [admin, recruiter, applicant]
 *           example: applicant
 *         isVerified:
 *           type: boolean
 *           example: true
 *         avatar:
 *           type: string
 *           example: uploads/1_1736625098123.png
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2025-09-01T10:20:30.000Z
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới (yêu cầu email @gmail.com)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản!
 *       400:
 *         description: Chỉ chấp nhận email @gmail.com!
 *       403:
 *         description: Không thể tự đăng ký với quyền admin!
 *       409:
 *         description: Email đã tồn tại!
 *       500:
 *         description: Lỗi server!
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập tài khoản
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token và thông tin user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Email hoặc mật khẩu không đúng!
 *       403:
 *         description: Tài khoản chưa được xác thực qua email!
 *       500:
 *         description: Lỗi server!
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại (yêu cầu token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Không có token, truy cập bị từ chối!
 */
