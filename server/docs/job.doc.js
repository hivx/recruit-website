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
 *     summary: Lấy danh sách tất cả bài tuyển dụng
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Danh sách bài tuyển dụng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
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
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết bài tuyển dụng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Không tìm thấy bài tuyển dụng
 */
