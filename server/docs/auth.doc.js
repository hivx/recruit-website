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
 *
 *   schemas:
 *     CompanySummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 9
 *         legal_name:
 *           type: string
 *           example: "ABC Technology Co., Ltd."
 *         verificationStatus:
 *           type: string
 *           nullable: true
 *           description: Trạng thái xác thực công ty (submitted|verified|rejected)
 *           example: "verified"
 *
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
 *           example: "Chu Văn Hiếu"
 *         email:
 *           type: string
 *           format: email
 *           example: "chuvanhieu357@gmail.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "123456"
 *         role:
 *           type: string
 *           enum: [admin, recruiter, applicant]
 *           example: "applicant"
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "chuvanhieu357@gmail.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "123456"
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Chu Văn Hiếu"
 *         email:
 *           type: string
 *           example: "chuvanhieu357@gmail.com"
 *         role:
 *           type: string
 *           enum: [admin, recruiter, applicant]
 *           example: "applicant"
 *         isVerified:
 *           type: boolean
 *           example: true
 *         avatar:
 *           type: string
 *           example: "uploads/pic.jpg"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2025-09-01T10:20:30.000Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-01T12:34:56.000Z
 *         company:
 *           oneOf:
 *             - $ref: '#/components/schemas/CompanySummary'
 *             - type: "null"
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản!"
 *       400:
 *         description: Dữ liệu không hợp lệ!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     notGmail:
 *                       summary: Chỉ chấp nhận @gmail.com
 *                       value: "Chỉ chấp nhận email @gmail.com!"
 *                     weakPwd:
 *                       summary: Mật khẩu yếu
 *                       value: "Mật khẩu phải có ít nhất 6 ký tự!"
 *                     missing:
 *                       summary: Thiếu trường
 *                       value: "Thiếu name/email/password!"
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
 *     summary: Đăng nhập tài khoản (chỉ khi tài khoản đã xác minh email)
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
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
 *         description: Trả về thông tin người dùng hiện tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Không có token, truy cập bị từ chối!
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Xác minh email qua liên kết gửi trong mail
 *     description: Endpoint được nhúng trong email xác minh. Trả về HTML thông báo thành công/thất bại.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xác minh thành công (trả về HTML)
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn (trả về HTML)
 *       500:
 *         description: Lỗi server!
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Yêu cầu đặt lại mật khẩu (gửi email xác nhận)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "chuvanhieu357@gmail.com"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "654321"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: Liên kết xác nhận đã được gửi tới email!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Liên kết xác nhận đã được gửi tới email của bạn!"
 *       400:
 *         description: Thiếu dữ liệu hoặc mật khẩu không hợp lệ!
 *       404:
 *         description: Email không tồn tại!
 *       500:
 *         description: Lỗi server!
 */

/**
 * @swagger
 * /api/auth/reset-password/confirm:
 *   get:
 *     summary: Xác nhận đặt lại mật khẩu qua liên kết trong email
 *     description: Endpoint mở từ email để xác nhận reset. Trả về HTML thông báo thành công/thất bại.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công (trả về HTML)
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn (trả về HTML)
 *       500:
 *         description: Lỗi server!
 */
