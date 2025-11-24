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
 *     CompanyVerification:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [submitted, verified, rejected]
 *           example: "verified"
 *         rejection_reason:
 *           type: string
 *           nullable: true
 *           example: "Thiếu giấy phép kinh doanh"
 *         submitted_at:
 *           type: string
 *           format: date-time
 *           example: "2025-10-18T17:00:49.174Z"
 *         verified_at:
 *           type: string
 *           format: date-time
 *           example: "2025-10-18T17:15:00.000Z"
 *         reviewed_by:
 *           type: string
 *           nullable: true
 *           example: "2"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JobApprovalResponse:
 *       type: object
 *       properties:
 *         job_id:
 *           type: string
 *           example: "3"
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: approved
 *         reason:
 *           type: string
 *           nullable: true
 *           example: "Mô tả chưa đầy đủ"
 *         audited_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-19T09:15:00.000Z
 */

/**
 * @swagger
 * /api/jobs/admin/{id}/approve:
 *   patch:
 *     summary: Admin duyệt bài đăng tuyển dụng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của job cần duyệt
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: approved
 *     responses:
 *       200:
 *         description: Duyệt job thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApprovalResponse'
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy job
 */

/**
 * @swagger
 * /api/jobs/admin/{id}/reject:
 *   patch:
 *     summary: Admin từ chối bài đăng tuyển dụng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của job cần từ chối
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Mô tả công việc chưa rõ ràng."
 *     responses:
 *       200:
 *         description: Từ chối job thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApprovalResponse'
 *       404:
 *         description: Không tìm thấy job
 */

/**
 * @swagger
 * /api/companies/admin/{id}/verify:
 *   patch:
 *     summary: Admin phê duyệt hoặc từ chối công ty
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID công ty cần duyệt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [verified, rejected]
 *                 example: "verified"
 *               reason:
 *                 type: string
 *                 description: Lý do từ chối (bắt buộc nếu status = rejected)
 *                 example: "Thiếu giấy phép kinh doanh."
 *     responses:
 *       200:
 *         description: Kết quả duyệt công ty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company_id:
 *                   type: string
 *                   example: "1"
 *                 status:
 *                   type: string
 *                   example: "verified"
 *                 rejection_reason:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 verified_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-18T17:15:00.000Z"
 *       400:
 *         description: Trạng thái không hợp lệ hoặc thiếu lý do khi từ chối
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy công ty
 */
