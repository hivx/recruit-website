/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng, thông tin cá nhân và danh sách yêu thích
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
 *     FavoriteJob:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Lập trình viên Backend Node.js"
 *         company:
 *           type: string
 *           example: "Công ty TNHH ABC"
 *         location:
 *           type: string
 *           example: "Hà Nội"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T12:34:56.789Z"
 *
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Nguyễn Văn Víp"
 *         email:
 *           type: string
 *           format: email
 *           example: "nguyenvanb@gmail.com"
 *
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
 *
 *     ChangePasswordInput:
 *       type: object
 *       required:
 *         - oldPassword
 *         - newPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *           format: password
 *           example: "123456"
 *         newPassword:
 *           type: string
 *           format: password
 *           example: "newpass789"
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
 *                   examples:
 *                     added:
 *                       summary: Thêm yêu thích
 *                       value: "Đã thêm vào danh sách yêu thích"
 *                     removed:
 *                       summary: Gỡ yêu thích
 *                       value: "Đã gỡ khỏi danh sách yêu thích"
 *       400:
 *         description: ID công việc không hợp lệ!
 *       401:
 *         description: Không có token, truy cập bị từ chối!
 *       404:
 *         description: Không tìm thấy công việc hoặc công việc chưa được duyệt!
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
 *         description: Không có token, truy cập bị từ chối!
 *       404:
 *         description: Người dùng không tồn tại!
 */

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Cập nhật thông tin cá nhân người dùng
 *     description: Nhận multipart/form-data để hỗ trợ upload avatar. Email (nếu đổi) phải hợp lệ và chưa bị sử dụng.
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
 *                 example: "Nguyễn Văn Víp"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "snonamevx@gmail.com"
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
 *         description: Email không hợp lệ hoặc đã tồn tại / dữ liệu sai
 *       401:
 *         description: Không có token, truy cập bị từ chối!
 *       404:
 *         description: Người dùng không tồn tại!
 *       415:
 *         description: Định dạng file avatar không được hỗ trợ!
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
 *                   example: "Đổi mật khẩu thành công!"
 *       400:
 *         description: Thiếu dữ liệu hoặc mật khẩu cũ không đúng!
 *       401:
 *         description: Không có token, truy cập bị từ chối!
 *       404:
 *         description: Người dùng không tồn tại!
 */

/**
 * @swagger
 * /api/users/vector/rebuild:
 *   post:
 *     summary: Tính lại vector người dùng (skills + hành vi)
 *     description: Kết hợp user_skills và user_behavior_profile để sinh UserVector cho user đang đăng nhập.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vector đã được tính lại thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tính lại vector người dùng thành công!"
 *                 vector:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       example: "4"
 *                     skill_profile:
 *                       type: array
 *                       description: Danh sách kỹ năng dạng {id, w}
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           w:
 *                             type: number
 *                             format: float
 *                             example: 0.85
 *                     tag_profile:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["backend", "nodejs"]
 *                     title_keywords:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["backend", "nodejs"]
 *                     preferred_location:
 *                       type: string
 *                       example: "Hồ Chí Minh"
 *                     salary_expected:
 *                       type: integer
 *                       example: 20000000
 *       400:
 *         description: Chưa có behavior profile hoặc dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
