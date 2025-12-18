/**
 * @swagger
 * tags:
 *   name: Companies
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
 *           example: "123 Nguyễn Văn Linh, Quận 7, Hồ Chí Minh"
 *         incorporation_date:
 *           type: string
 *           format: date-time
 *           example: "2018-07-01T00:00:00.000Z"
 *         owner_id:
 *           type: string
 *           example: "4"
 *
 *         # thêm trường logo vào response
 *         logo:
 *           type: string
 *           nullable: true
 *           example: "uploads/company/logo.png"
 *
 *         verification:
 *           $ref: '#/components/schemas/CompanyVerification'
 *
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
 *           example: "123 Nguyễn Văn Linh, Quận 7, Hồ Chí Minh"
 *         incorporation_date:
 *           type: string
 *           format: date
 *           example: "2018-07-01"
 *
 *         # thêm logo vào input
 *         logo:
 *           type: string
 *           nullable: true
 *           example: "uploads/company/logo.png"
 *
 *
 *     UpdateCompanyInput:
 *       type: object
 *       properties:
 *         legal_name:
 *           type: string
 *           example: "Công ty TNHH ABC Tech Việt Nam"
 *         registered_address:
 *           type: string
 *           example: "456 Nguyễn Trãi, Quận 5, Hồ Chí Minh"
 *         tax_id:
 *           type: string
 *           example: "9876543210"
 *         incorporation_date:
 *           type: string
 *           format: date
 *           example: "2019-01-15"
 *
 *         # thêm logo vào update input
 *         logo:
 *           type: string
 *           nullable: true
 *           example: "uploads/company/new_logo.png"
 */

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Tạo công ty mới (chỉ recruiter hoặc admin)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               registration_number:
 *                 type: string
 *               tax_id:
 *                 type: string
 *               country_code:
 *                 type: string
 *               registered_address:
 *                 type: string
 *               incorporation_date:
 *                 type: string
 *                 format: date
 *               # logo dạng file
 *               logo:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       201:
 *         description: Tạo công ty thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponse'
 */

/**
 * @swagger
 * /api/companies/me:
 *   get:
 *     summary: Lấy thông tin công ty của recruiter hiện tại
 *     tags: [Companies]
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
 *     summary: Cập nhật thông tin công ty
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               legal_name:
 *                 type: string
 *               registered_address:
 *                 type: string
 *               tax_id:
 *                 type: string
 *               incorporation_date:
 *                 type: string
 *                 format: date
 *               # logo dạng file
 *               logo:
 *                 type: string
 *                 format: binary
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
 *     tags: [Companies]
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
 *       404:
 *         description: Không tìm thấy công ty
 */

/**
 * @swagger
 * /api/companies/admin:
 *   get:
 *     summary: Admin lấy danh sách tất cả công ty
 *     description: |
 *       Chỉ admin được phép truy cập.
 *       Hỗ trợ phân trang.
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số bản ghi mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách công ty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CompanyResponse'
 *                 total:
 *                   type: integer
 *                   example: 120
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 6
 *       403:
 *         description: Không có quyền (chỉ admin)
 */

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Admin lấy chi tiết thông tin một công ty
 *     description: |
 *       Chỉ admin được phép truy cập.
 *       Trả về đầy đủ thông tin công ty và trạng thái xác thực.
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của công ty
 *     responses:
 *       200:
 *         description: Thông tin chi tiết công ty
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponse'
 *       403:
 *         description: Không có quyền (chỉ admin)
 *       404:
 *         description: Không tìm thấy công ty
 */
