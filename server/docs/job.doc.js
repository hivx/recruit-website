/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: API cho việc làm
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Đăng tin tuyển dụng mới
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
 *                 example: Tuyển gấp lập trình viên ReactJS có kinh nghiệm
 *               salary:
 *                 type: number
 *                 example: 15000000
 *               requirements:
 *                 type: string
 *                 example: Có ít nhất 1 năm kinh nghiệm
 *     responses:
 *       201:
 *         description: Đăng bài thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       401:
 *         description: Không có quyền truy cập
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Lấy danh sách việc làm
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Danh sách việc làm
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
 *     summary: Lấy chi tiết 1 việc làm
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID bài tuyển dụng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin bài tuyển dụng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Không tìm thấy bài tuyển dụng
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
 *         title:
 *           type: string
 *         company:
 *           type: string
 *         location:
 *           type: string
 *         description:
 *           type: string
 *         salary:
 *           type: number
 *         requirements:
 *           type: string
 *         createdBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

