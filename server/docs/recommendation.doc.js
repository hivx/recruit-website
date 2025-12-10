/**
 * @swagger
 * /api/recommendations/{userId}:
 *   post:
 *     summary: Sinh gợi ý công việc cho người dùng
 *     description: |
 *       Dựa vào vector của user + vector của job, tính fit_score theo thuật toán của bạn.
 *       Sau đó **upsert** vào bảng job_recommendations và trả về kết quả.
 *     tags: [Recommendations]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID của user
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách job được recommend cho user
 *         content:
 *           application/json:
 *             example:
 *               message: "Recommendations generated"
 *               data:
 *                 - id: 12
 *                   user_id: 1
 *                   job_id: 7
 *                   fit_score: 0.7123
 *                   reason: "Mức độ phù hợp cao, Trùng nhóm ngành/lĩnh vực"
 *                   is_sent: false
 *                   status: "pending"
 *                   recommended_at: "2025-11-18T..."
 *                   updated_at: "2025-11-18T..."
 *       404:
 *         description: không tìm thấy userVector
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/recommendations/recruiter/{userId}:
 *   post:
 *     summary: Gợi ý ứng viên phù hợp cho nhà tuyển dụng
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID recruiter
 *     responses:
 *       200:
 *         description: Danh sách ứng viên phù hợp
 *       400:
 *         description: Lỗi dữ liệu hoặc recruiter không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không đủ quyền
 */
/**
 * @swagger
 * components:
 *   schemas:
 *
 *     JobRecommendationItem:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           example: 5
 *         job_id:
 *           type: integer
 *           example: 12
 *         fit_score:
 *           type: number
 *           format: float
 *           example: 0.78
 *         reason:
 *           type: string
 *           example: "Phù hợp kỹ năng: Node.js, ReactJS"
 *         status:
 *           type: string
 *           example: "pending"
 *         job:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 12
 *             title:
 *               type: string
 *               example: "Backend Node.js Developer"
 *             location:
 *               type: string
 *               example: "Hà Nội"
 *             company:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 3
 *                 legal_name:
 *                   type: string
 *                   example: "ABC Tech Ltd."
 *             tags:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 10
 *                   name:
 *                     type: string
 *                     example: "Node.js"
 *
 *
 *     JobRecommendationListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/JobRecommendationItem"
 *         total:
 *           type: integer
 *           example: 42
 *         page:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 5
 *
 *
 *     CandidateRecommendation:
 *       type: object
 *       properties:
 *         recruiter_id:
 *           type: integer
 *           example: 9
 *         applicant_id:
 *           type: integer
 *           example: 15
 *         fit_score:
 *           type: number
 *           format: float
 *           example: 0.82
 *         reason:
 *           type: string
 *           nullable: true
 *           example: "Ứng viên phù hợp với yêu cầu Node.js + 2 năm kinh nghiệm"
 *         status:
 *           type: string
 *           example: "pending"
 *         recommended_at:
 *           type: string
 *           format: date-time
 *           example: "2025-11-18T10:15:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-11-18T10:20:00.000Z"
 *
 *         applicant:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 15
 *             name:
 *               type: string
 *               example: "Nguyễn Văn Ứng Viên"
 *             email:
 *               type: string
 *               example: "candidate@example.com"
 *             avatar:
 *               type: string
 *               example: "uploads/avatars/15.png"
 *             role:
 *               type: string
 *               example: "applicant"
 *
 *         recruiter:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 9
 *             name:
 *               type: string
 *               example: "Trần Thị Tuyển Dụng"
 *             email:
 *               type: string
 *               example: "recruiter@example.com"
 *             avatar:
 *               type: string
 *               example: "uploads/avatars/9.png"
 *             role:
 *               type: string
 *               example: "recruiter"
 */

/**
 * @swagger
 * /api/recommendations/{userId}:
 *   get:
 *     summary: Lấy danh sách job được đề xuất cho user (chỉ job đã được approved)
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của user (ứng viên)
 *       - in: query
 *         name: min_score
 *         schema:
 *           type: number
 *           format: float
 *         description: Chỉ lấy job có fit_score >= min_score
 *         example: 0.3
 *
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Lọc theo địa điểm (job.location LIKE %location%)
 *         example: "Hà Nội"
 *
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Lọc theo tag (job phải có ít nhất 1 tag trùng)
 *         example: ["Node.js", "React"]
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Trang muốn lấy
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Số lượng item mỗi trang
 *
 *     responses:
 *       200:
 *         description: Danh sách job được đề xuất (đã qua lọc, chỉ job approved)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/JobRecommendationListResponse"
 *
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *
 *       403:
 *         description: Không có quyền xem recommendation của user khác
 */

/**
 * @swagger
 * /api/recommendations/recruiter/{userId}:
 *   get:
 *     summary: Lấy danh sách ứng viên được đề xuất cho recruiter
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID recruiter
 *     responses:
 *       200:
 *         description: Danh sách ứng viên được đề xuất
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/CandidateRecommendation"
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập
 */
