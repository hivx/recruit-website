/**
 * @swagger
 * tags:
 *   - name: Skills
 *     description: Danh mục kỹ năng & kỹ năng của người dùng
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
 *     Skill:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         name:
 *           type: string
 *           example: "Node.js"
 *
 *     UserSkillItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID của skill (tham chiếu bảng Skill)
 *           example: 10
 *         name:
 *           type: string
 *           example: "Node.js"
 *         level:
 *           type: integer
 *           nullable: true
 *           description: Mức độ thành thạo (tuỳ business rule, ví dụ 1-5)
 *           example: 3
 *         years:
 *           type: number
 *           nullable: true
 *           description: Số năm kinh nghiệm
 *           example: 2
 *         note:
 *           type: string
 *           nullable: true
 *           example: "Đã dùng trong dự án sản xuất"
 *
 *     MySkillsResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 2
 *         skills:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserSkillItem'
 *
 *     UpsertUserSkillRequest:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: "Node.js"
 *         level:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         years:
 *           type: number
 *           nullable: true
 *           example: 2
 *         note:
 *           type: string
 *           nullable: true
 *           example: "Dự án thực tế"
 *
 *     BasicMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Thành công"
 */

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Danh sách kỹ năng (public)
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           type: string
 *         description: Từ khoá tìm kiếm theo tên kỹ năng (contains)
 *     responses:
 *       200:
 *         description: Danh sách kỹ năng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
 *             examples:
 *               empty:
 *                 summary: Không có kết quả
 *                 value: []
 *               hasItems:
 *                 summary: Có kết quả
 *                 value:
 *                   - { "id": 1, "name": "JavaScript" }
 *                   - { "id": 2, "name": "TypeScript" }
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/skills/my-skills:
 *   get:
 *     summary: Lấy danh sách kỹ năng của chính người dùng
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách kỹ năng của tôi (có thể rỗng)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MySkillsResponse'
 *             examples:
 *               empty:
 *                 summary: Chưa có kỹ năng
 *                 value: { "total": 0, "skills": [] }
 *               filled:
 *                 summary: Có dữ liệu
 *                 value:
 *                   total: 2
 *                   skills:
 *                     - { "id": 10, "name": "Node.js", "level": 3, "years": 2, "note": null, "verified": false }
 *                     - { "id": 11, "name": "PostgreSQL", "level": 2, "years": 1, "note": "đã làm prod", "verified": false }
 *       401:
 *         description: Thiếu hoặc sai token
 *       500:
 *         description: Lỗi server
 *
 *   put:
 *     summary: Thêm/Cập nhật (upsert) kỹ năng của chính người dùng
 *     description: Upsert theo tên kỹ năng. Service sẽ upsert Skill (nếu chưa có) và cập nhật UserSkill tương ứng.
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertUserSkillRequest'
 *           examples:
 *             full:
 *               summary: Đầy đủ trường
 *               value: { "name": "Node.js", "level": 3, "years": 2, "note": "Dự án thực tế" }
 *             minimal:
 *               summary: Chỉ tên
 *               value: { "name": "Python" }
 *     responses:
 *       200:
 *         description: Upsert thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BasicMessage'
 *             examples:
 *               ok:
 *                 value: { "message": "Cập nhật kỹ năng thành công!" }
 *       400:
 *         description: Thiếu tên kỹ năng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BasicMessage'
 *             examples:
 *               missingName:
 *                 value: { "message": "Thiếu tên kỹ năng!" }
 *       401:
 *         description: Thiếu hoặc sai token
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/skills/my-skills/{skillId}:
 *   delete:
 *     summary: Xoá kỹ năng khỏi hồ sơ của chính người dùng
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID skill cần xoá
 *         example: 10
 *     responses:
 *       200:
 *         description: Xoá thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BasicMessage'
 *             examples:
 *               ok:
 *                 value: { "message": "Đã xoá kỹ năng" }
 *       404:
 *         description: Không tìm thấy kỹ năng hoặc không thuộc người dùng
 *       401:
 *         description: Thiếu hoặc sai token
 *       500:
 *         description: Lỗi server
 */
