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
 *           example: /uploads/1736725098123_cv.pdf
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "0987654321"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2025-09-12T12:34:56.000Z
 *
 *     ApplicantInfo:
 *       type: object
 *       properties:
 *         applicantName:
 *           type: string
 *           example: "Chu Văn Hiếu"
 *         applicantEmail:
 *           type: string
 *           example: "chuvanhieu357@gmail.com"
 *         applicantAvatar:
 *           type: string
 *           example: "/uploads/avatars/1_1736625098123.png"
 *         coverLetter:
 *           type: string
 *           example: Tôi có 3 năm kinh nghiệm ReactJS...
 *         cv:
 *           type: string
 *           example: http://localhost:5000/uploads/1736725098123_cv.pdf
 *         phone:
 *           type: string
 *           example: "0901234567"
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-09-12T14:32:01.123Z
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
 *             properties:
 *               jobId:
 *                 type: string
 *                 example: "1"
 *               coverLetter:
 *                 type: string
 *                 example: Tôi rất quan tâm tới vị trí này và tin rằng mình phù hợp...
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: File CV (PDF, DOC, DOCX) - Không bắt buộc nhưng nếu thiếu sẽ báo lỗi
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Ứng tuyển thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ứng tuyển thành công!
 *                 application:
 *                   $ref: '#/components/schemas/Application'
 *       400:
 *         description: Bạn đã ứng tuyển công việc này rồi hoặc chưa tải lên file CV!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chưa tải lên file CV!"
 *       401:
 *         description: Không có token, truy cập bị từ chối!
 *       403:
 *         description: Chỉ ứng viên (applicant hoặc admin) mới có thể ứng tuyển!
 *       404:
 *         description: Không tìm thấy công việc với ID đã cung cấp!
 */

/**
 * @swagger
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: Nhà tuyển dụng lấy danh sách ứng viên đã ứng tuyển vào một công việc
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
 *                     $ref: '#/components/schemas/ApplicantInfo'
 *       404:
 *         description: Không có ứng viên nào ứng tuyển cho công việc này!
 *       500:
 *         description: Lỗi server khi lấy danh sách ứng viên!
 */
