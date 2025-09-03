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
 *         description: Đăng ký thành công, vui lòng xác thực email
 *       400:
 *         description: Email không hợp lệ hoặc không phải @gmail.com
 *       409:
 *         description: Email đã tồn tại
 *       500:
 *         description: Lỗi server
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
 *         description: Thông tin đăng nhập không hợp lệ hoặc chưa xác thực email
 *       500:
 *         description: Lỗi server
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
 *         description: Không có hoặc token không hợp lệ
 */
