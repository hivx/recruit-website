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

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyLite:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "5"
 *         legal_name:
 *           type: string
 *           example: "Acme Company Ltd."
 *
 *     JobLite:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "88"
 *         title:
 *           type: string
 *           example: "Backend Engineer"
 *         company:
 *           $ref: '#/components/schemas/CompanyLite'
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Node.js", "PostgreSQL", "AWS"]
 *
 *     MyApplication:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "123"
 *         status:
 *           $ref: '#/components/schemas/ApplicationStatus'
 *         fit_score:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 0.72
 *         applied_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-20T09:15:22.000Z
 *         job:
 *           $ref: '#/components/schemas/JobLite'
 */

/**
 * @swagger
 * /api/applications/me:
 *   get:
 *     summary: Ứng viên xem danh sách đơn ứng tuyển của chính mình
 *     description: Trả về toàn bộ đơn ứng tuyển của user hiện tại (theo JWT). Không phân trang ở phiên bản đầu.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn ứng tuyển (có thể rỗng)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 2
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MyApplication'
 *             examples:
 *               emptyList:
 *                 summary: Không có đơn nào
 *                 value:
 *                   total: 0
 *                   applications: []
 *               hasData:
 *                 summary: Có dữ liệu
 *                 value:
 *                   total: 2
 *                   applications:
 *                     - id: "123"
 *                       status: "pending"
 *                       fit_score: 0.78
 *                       applied_at: "2025-10-20T09:15:22.000Z"
 *                       job:
 *                         id: "88"
 *                         title: "Backend Engineer"
 *                         company:
 *                           id: "5"
 *                           legal_name: "Acme Company Ltd."
 *                         tags: ["Node.js", "PostgreSQL", "AWS"]
 *                     - id: "124"
 *                       status: "accepted"
 *                       fit_score: 0.65
 *                       applied_at: "2025-10-22T08:01:10.000Z"
 *                       job:
 *                         id: "91"
 *                         title: "Data Engineer"
 *                         company:
 *                           id: "5"
 *                           legal_name: "Acme Company Ltd."
 *                         tags: ["Python", "Airflow", "GCP"]
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server khi lấy danh sách đơn ứng tuyển
 */

/**
 * @swagger
 * /api/applications/{id}/review:
 *   patch:
 *     summary: Đánh giá hồ sơ ứng viên (recruiter chỉ đánh giá job của mình hoặc admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "14"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "accepted"
 *               note:
 *                 type: string
 *                 example: "Ứng viên phù hợp, có thể mời phỏng vấn."
 *     responses:
 *       200:
 *         description: Đánh giá thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đánh giá hồ sơ thành công!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "42"
 *                     job_id:
 *                       type: string
 *                       example: "12"
 *                     job_title:
 *                       type: string
 *                       example: "Backend Developer"
 *                     status:
 *                       type: string
 *                       example: "accepted"
 *                     review_note:
 *                       type: string
 *                       example: "Ứng viên có kỹ năng tốt, nên mời phỏng vấn."
 *                     reviewed_by:
 *                       type: string
 *                       example: "3"
 *                     reviewed_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-10T09:45:00.000Z"
 *       403:
 *         description: Không có quyền đánh giá hồ sơ này
 *       404:
 *         description: Không tìm thấy hồ sơ ứng tuyển
 */

/**
 * @swagger
 * /api/applications/{id}:
 *   put:
 *     summary: Cập nhật hồ sơ ứng tuyển (chỉ khi trạng thái là "pending")
 *     description: Ứng viên được phép chỉnh sửa hồ sơ của chính mình khi trạng thái hiện tại là `pending`. Admin có thể chỉnh sửa mọi hồ sơ. Cho phép cập nhật thông tin hoặc tải lại file CV.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "14"
 *         description: ID hồ sơ ứng tuyển cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *                 example: "Tôi muốn bổ sung thêm kinh nghiệm làm việc gần đây..."
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 description: Số điện thoại (tùy chọn). Nếu gửi lên phải khớp định dạng /^0\\d{9}$/.
 *                 example: "0987654321"
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: File CV (PDF/DOC/DOCX) mới (nếu muốn cập nhật lại).
 *     responses:
 *       200:
 *         description: Cập nhật hồ sơ ứng tuyển thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật hồ sơ ứng tuyển thành công!"
 *                 application:
 *                   $ref: '#/components/schemas/Application'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc hồ sơ không ở trạng thái pending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidPhone:
 *                       summary: Số điện thoại sai định dạng
 *                       value: "Số điện thoại không hợp lệ!"
 *                     invalidData:
 *                       summary: Không có dữ liệu hợp lệ để cập nhật
 *                       value: "Không có dữ liệu hợp lệ để cập nhật!"
 *                     notPending:
 *                       summary: Hồ sơ không ở trạng thái pending
 *                       value: "Chỉ có thể chỉnh sửa hồ sơ khi trạng thái là 'pending'!"
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền cập nhật hồ sơ này
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bạn không có quyền cập nhật hồ sơ này!"
 *       404:
 *         description: Không tìm thấy hồ sơ ứng tuyển
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy hồ sơ ứng tuyển!"
 */

/**
 * @swagger
 * /api/applications/recruiter:
 *   get:
 *     summary: Lấy danh sách ứng viên của tất cả job do recruiter tạo
 *     description: |
 *       Lấy toàn bộ hồ sơ ứng tuyển thuộc về các công việc do recruiter hiện tại tạo ra.
 *       Hỗ trợ phân trang và lọc theo trạng thái hoặc theo jobId.
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Số ứng viên mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         description: Lọc theo trạng thái đơn ứng tuyển
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *           example: "15"
 *         description: Lọc theo ID công việc
 *     responses:
 *       200:
 *         description: Danh sách ứng viên của recruiter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 applicants:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Chỉ recruiter hoặc admin mới được truy cập
 *       500:
 *         description: Lỗi server khi lấy danh sách ứng viên
 */
