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
 *     Job:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64e9d3c2e4f57e1234567890
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
 *           example: Tuyển lập trình viên ReactJS có kinh nghiệm
 *         salary:
 *           type: string
 *           example: 15000000
 *         requirements:
 *           type: string
 *           example: Có ít nhất 1 năm kinh nghiệm
 *         createdBy:
 *           type: object
 *           nullable: true
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         createdByName:
 *           type: string
 *           example: Nguyễn Văn A
 *           description: Tên người tạo bài viết, vẫn lưu ngay cả khi tài khoản bị xoá
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *               salary:
 *                 type: string
 *                 example: 15000000
 *               requirements:
 *                 type: string
 *                 example: Kinh nghiệm 1 năm ReactJS
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["IT", "Marketing"]
 *
 *     responses:
 *       201:
 *         description: Bài tuyển dụng đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền tạo bài viết
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
 *         description: Số trang hiện tại (phân trang)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng job trên mỗi trang
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
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: Lỗi server khi lấy danh sách việc làm
 */

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Lấy chi tiết bài tuyển dụng theo ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của bài tuyển dụng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết bài tuyển dụng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 company:
 *                   type: string
 *                 location:
 *                   type: string
 *                 description:
 *                   type: string
 *                 salary:
 *                   type: string
 *                 requirements:
 *                   type: string
 *                 createdBy:
 *                   type: string
 *                 createdByName:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 createdAtFormatted:
 *                   type: string
 *                   description: "Ngày giờ định dạng DD/MM/YYYY HH:mm"
 *                 isFavorite:
 *                   type: boolean
 *                   description: "Có được user login đánh dấu yêu thích không"
 *       404:
 *         description: Không tìm thấy bài tuyển dụng
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
 *                     type: number
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
 *         description: ID của bài tuyển dụng cần cập nhật
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               salary:
 *                 type: string
 *               requirements:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               createdByName:
 *                 type: string
 *             required:
 *               - title
 *               - company
 *               - createdByName
 *     responses:
 *       200:
 *         description: Cập nhật công việc thành công
 *       403:
 *         description: Bạn không có quyền sửa công việc này
 *       404:
 *         description: Không tìm thấy công việc
 *       500:
 *         description: Lỗi server khi cập nhật công việc
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
 *         description: ID của bài tuyển dụng cần xóa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa công việc thành công
 *       403:
 *         description: Bạn không có quyền xóa công việc này
 *       404:
 *         description: Không tìm thấy công việc
 *       500:
 *         description: Lỗi server khi xóa công việc
 */
