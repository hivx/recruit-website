/**
 * @swagger
 * tags:
 *   - name: Applications
 *     description: Quản lý đơn ứng tuyển
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "101"
 *         job_id:
 *           type: string
 *           example: "1"
 *         applicant_id:
 *           type: string
 *           example: "5"
 *         cover_letter:
 *           type: string
 *           example: Tôi rất quan tâm tới vị trí này và tin rằng mình phù hợp...
 *         cv:
 *           type: string
 *           nullable: true
 *           example: /uploads/cv_1725353678.pdf
 *         phone:
 *           type: string
 *           nullable: true
 *           example: 0987654321
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2025-09-03T12:34:56.000Z
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Ứng viên nộp đơn ứng tuyển vào một công việc
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - coverLetter
 *               - phone
 *               - cv
 *             properties:
 *               jobId:
 *                 type: string
 *                 example: "1"
 *               coverLetter:
 *                 type: string
 *                 example: Tôi rất quan tâm tới vị trí này và tin rằng mình phù hợp...
 *               phone:
 *                 type: string
 *                 example: 0987654321
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: File CV (chỉ hỗ trợ PDF, DOC, DOCX)
 *     responses:
 *       201:
 *         description: Ứng tuyển thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Đã ứng tuyển trước đó hoặc dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       403:
 *         description: Chỉ ứng viên (applicant hoặc admin) mới có thể ứng tuyển
 *       404:
 *         description: Không tìm thấy công việc với ID đã cung cấp
 */

/**
 * @swagger
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: Lấy danh sách ứng viên đã ứng tuyển vào một công việc
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         description: ID công việc
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: Danh sách ứng viên đã ứng tuyển
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalApplicants:
 *                   type: integer
 *                   example: 5
 *                 applicants:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *       404:
 *         description: Không tìm thấy ứng viên nào
 *       500:
 *         description: Lỗi server khi lấy danh sách ứng viên
 */
