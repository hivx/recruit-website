/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng, thông tin cá nhân và danh sách yêu thích
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FavoriteJob:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Lập trình viên Backend Node.js
 *         company:
 *           type: string
 *           example: Công ty TNHH ABC
 *         location:
 *           type: string
 *           example: Hà Nội
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2025-09-01T12:34:56.789Z
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Nguyễn Văn B
 *         email:
 *           type: string
 *           format: email
 *           example: nguyenvanb@gmail.com
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Nguyễn Văn B
 *         email:
 *           type: string
 *           example: nguyenvanb@gmail.com
 *         role:
 *           type: string
 *           enum: [admin, recruiter, applicant]
 *           example: applicant
 *         isVerified:
 *           type: boolean
 *           example: true
 *         avatar:
 *           type: string
 *           example: /uploads/avatars/1_1736625098123.png
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2025-09-01T10:20:30.000Z
 *     ChangePasswordInput:
 *       type: object
 *       required:
 *         - oldPassword
 *         - newPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *           format: password
 *           example: 123456
 *         newPassword:
 *           type: string
 *           format: password
 *           example: newpass789
 */

/**
 * @swagger
 * /api/users/favorite/{jobId}:
 *   post:
 *     summary: Thêm hoặc gỡ một công việc khỏi danh sách yêu thích
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID công việc
 *     responses:
 *       200:
 *         description: Cập nhật danh sách yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đã thêm vào danh sách yêu thích
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng hoặc công việc
 */

/**
 * @swagger
 * /api/users/favorite:
 *   get:
 *     summary: Lấy danh sách công việc yêu thích của người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách công việc yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorites:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FavoriteJob'
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 */

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Cập nhật thông tin cá nhân (name/email/avatar)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyễn Văn B
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nguyenvanb@gmail.com
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh đại diện (jpg, png, webp, ...)
 *     responses:
 *       200:
 *         description: Cập nhật thành công, trả về thông tin user mới
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 */

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Đổi mật khẩu người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu cũ không đúng hoặc dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 */
