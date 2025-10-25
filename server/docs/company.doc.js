/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Quản lý công ty của nhà tuyển dụng và xác thực công ty
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
 *           example: "2018-07-01T00:00:00.000Z"
 *         owner_id:
 *           type: string
 *           example: "4"
 *         verification:
 *           $ref: '#/components/schemas/CompanyVerification'
 *
 *     CreateCompanyInput:
 *       type: object
 *       required:
 *         - legal_name
 *         - registration_number
 *         - country_code
 *         - registered_address
 *       properties:
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
 *           format: date
 *           example: "2018-07-01"
 *
 *     UpdateCompanyInput:
 *       type: object
 *       properties:
 *         legal_name:
 *           type: string
 *           example: "Công ty TNHH ABC Tech Việt Nam"
 *         registered_address:
 *           type: string
 *           example: "456 Nguyễn Trãi, Quận 5, TP.HCM"
 *         tax_id:
 *           type: string
 *           example: "9876543210"
 *         incorporation_date:
 *           type: string
 *           format: date
 *           example: "2019-01-15"
 */

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Tạo công ty mới (chỉ recruiter hoặc admin)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompanyInput'
 *     responses:
 *       201:
 *         description: Tạo công ty thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponse'
 *       400:
 *         description: Thiếu trường bắt buộc hoặc dữ liệu không hợp lệ
 *       403:
 *         description: Chỉ recruiter/admin mới được tạo công ty
 *       409:
 *         description: Đã tồn tại công ty cho recruiter này hoặc trùng registration_number
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
 *     summary: Cập nhật thông tin công ty (chỉ khi trạng thái chưa verified)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCompanyInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponse'
 *       403:
 *         description: Công ty đã được xác thực (verified), không thể chỉnh sửa
 *       404:
 *         description: Không tìm thấy công ty
 */

/**
 * @swagger
 * /api/companies/me/submit:
 *   post:
 *     summary: Nộp (hoặc nộp lại) yêu cầu xác thực công ty
 *     description: Chỉ cho phép nộp khi hiện tại không ở trạng thái verified. Nếu đang rejected sẽ chuyển sang submitted và reset rejection_reason.
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
 *                   format: date-time
 *                   example: "2025-10-19T08:40:00.000Z"
 *       403:
 *         description: Công ty đã được xác thực, không thể nộp lại
 *       404:
 *         description: Không tìm thấy công ty
 */
