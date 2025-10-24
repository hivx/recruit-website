/**
 * @swagger
 * tags:
 *   - name: Applications
 *     description: Quản lý đơn ứng tuyển
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
 *     ApplicationStatus:
 *       type: string
 *       enum: [pending, accepted, rejected]
 *       example: pending
 *
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
 *           example: Tôi rất hào hứng với cơ hội ứng tuyển vào vị trí này và tin rằng kinh nghiệm cùng kỹ năng chuyên môn của mình, bao gồm khả năng làm việc nhóm và giải quyết vấn đề, sẽ đóng góp tích cực cho sự phát triển của quý công ty.
 *         cv:
 *           type: string
 *           nullable: true
 *           example: uploads/1736725098123_cv.pdf
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "0987654321"
 *         status:
 *           $ref: '#/components/schemas/ApplicationStatus'
 *         fit_score:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 0.78
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
 *         coverLetter:
 *           type: string
 *           example: Tôi có 3 năm kinh nghiệm ReactJS...
 *         cv:
 *           type: string
 *           nullable: true
 *           example: "http://localhost:5000/uploads/1736725098123_cv.pdf"
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "0901234567"
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-09-12T14:32:01.123Z
 *         status:
 *           $ref: '#/components/schemas/ApplicationStatus'
 *         fitScore:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 0.65
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
 *               - cv
 *             properties:
 *               jobId:
 *                 type: string
 *                 example: "1"
 *               coverLetter:
 *                 type: string
 *                 example: Tôi rất hào hứng với cơ hội ứng tuyển vào vị trí này và tin rằng kinh nghiệm cùng kỹ năng chuyên môn của mình sẽ đóng góp tích cực cho sự phát triển của quý công ty.
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 description: Số điện thoại (tùy chọn). Nếu gửi lên phải khớp định dạng /^0\\d{9}$/
 *                 example: "0987654321"
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: File CV (PDF/DOC/DOCX) — BẮT BUỘC theo business rule
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
 *         description: Yêu cầu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missingCV:
 *                       summary: Thiếu file CV
 *                       value: "Chưa tải lên file CV!"
 *                     missingCover:
 *                       summary: Thiếu cover letter
 *                       value: "Thiếu coverLetter!"
 *                     invalidPhone:
 *                       summary: Số điện thoại sai định dạng
 *                       value: "Số điện thoại không hợp lệ!"
 *                     duplicated:
 *                       summary: Đã ứng tuyển
 *                       value: "Bạn đã ứng tuyển công việc này rồi!"
 *       401:
 *         description: Không có token, truy cập bị từ chối!
 *       403:
 *         description: Job chưa được duyệt hoặc không đủ quyền
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job chưa được duyệt!"
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
 *         description: Danh sách ứng viên (có thể rỗng)
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
 *       403:
 *         description: Bạn không có quyền cho công việc này!
 *       404:
 *         description: Không tìm thấy công việc!
 *       500:
 *         description: Lỗi server khi lấy danh sách ứng viên!
 */
