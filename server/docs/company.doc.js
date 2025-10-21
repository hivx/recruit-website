/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Quản lý công ty của nhà tuyển dụng và xác thực công ty
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyVerification:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [submitted, verified, rejected]
 *           example: verified
 *         rejection_reason:
 *           type: string
 *           nullable: true
 *           example: "Thiếu giấy phép kinh doanh"
 *         submitted_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-18T17:00:49.174Z
 *         verified_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-18T17:15:00.000Z
 *         reviewed_by:
 *           type: string
 *           example: "2"
 *
 *     CompanyResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1"
 *         legal_name:
 *           type: string
 *           example: "Công ty TNHH ABC Tech"
 *         registration_number:
 *           type: string
 *           example: "0312345678"
 *         tax_id:
 *           type: string
 *           example: "1234567890"
 *         country_code:
 *           type: string
 *           example: "VN"
 *         registered_address:
 *           type: string
 *           example: "123 Nguyễn Văn Linh, Quận 7, TP.HCM"
 *         incorporation_date:
 *           type: string
 *           format: date-time
 *           example: 2018-07-01T00:00:00.000Z
 *         owner_id:
 *           type: string
 *           example: "4"
 *         verification:
 *           $ref: '#/components/schemas/CompanyVerification'
 */

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Tạo công ty mới (chỉ recruiter)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - legal_name
 *               - registration_number
 *               - country_code
 *               - registered_address
 *             properties:
 *               legal_name:
 *                 type: string
 *                 example: "Công ty TNHH ABC Tech"
 *               registration_number:
 *                 type: string
 *                 example: "0312345678"
 *               tax_id:
 *                 type: string
 *                 example: "1234567890"
 *               country_code:
 *                 type: string
 *                 example: "VN"
 *               registered_address:
 *                 type: string
 *                 example: "123 Nguyễn Văn Linh, Quận 7, TP.HCM"
 *               incorporation_date:
 *                 type: string
 *                 format: date
 *                 example: "2018-07-01"
 *     responses:
 *       201:
 *         description: Tạo công ty thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponse'
 *       400:
 *         description: Thiếu trường bắt buộc
 *       409:
 *         description: Đã tồn tại công ty hoặc trùng registration_number
 */

/**
 * @swagger
 * /api/companies/me:
 *   get:
 *     summary: Lấy thông tin công ty của recruiter hiện tại
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin công ty
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponse'
 *       404:
 *         description: Chưa có công ty
 */

/**
 * @swagger
 * /api/companies/me:
 *   patch:
 *     summary: Cập nhật thông tin công ty (chỉ khi chưa verified)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               legal_name:
 *                 type: string
 *                 example: "Công ty TNHH ABC Tech Việt Nam"
 *               registered_address:
 *                 type: string
 *                 example: "456 Nguyễn Trãi, Quận 5, TP.HCM"
 *               tax_id:
 *                 type: string
 *                 example: "9876543210"
 *               incorporation_date:
 *                 type: string
 *                 example: "2019-01-15"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponse'
 *       403:
 *         description: Công ty đã được xác thực, không thể chỉnh sửa
 *       404:
 *         description: Không tìm thấy công ty
 */

/**
 * @swagger
 * /api/companies/me/submit:
 *   post:
 *     summary: Nộp lại yêu cầu xác thực công ty (sau khi bị từ chối)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nộp xét duyệt thành công
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
 *                   example: "submitted"
 *                 submitted_at:
 *                   type: string
 *                   example: "2025-10-19T08:40:00.000Z"
 *       403:
 *         description: Công ty đã được xác thực, không thể nộp lại
 */

/**
 * @swagger
 * /api/companies/admin/{id}/verify:
 *   patch:
 *     summary: Admin phê duyệt hoặc từ chối công ty
 *     tags: [Company]
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
 *                 example: verified
 *               reason:
 *                 type: string
 *                 description: Lý do từ chối (nếu có)
 *                 example: "Thiếu giấy phép kinh doanh"
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
 *                 verified_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Trạng thái không hợp lệ hoặc thiếu lý do
 *       404:
 *         description: Không tìm thấy công ty
 */
