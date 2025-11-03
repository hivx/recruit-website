/**
 * @swagger
 * tags:
 *   - name: Career Preferences
 *     description: Tiêu chí nghề nghiệp của ứng viên
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TagLite:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         name:
 *           type: string
 *           example: "Node.js"
 *
 *     CareerPreference:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           example: "5"
 *         desired_title:
 *           type: string
 *           nullable: true
 *           example: "Backend Developer"
 *         desired_company:
 *           type: string
 *           nullable: true
 *           example: "Tech Unicorn VN"
 *         desired_location:
 *           type: string
 *           nullable: true
 *           example: "TP.HCM"
 *         desired_salary:
 *           type: number
 *           nullable: true
 *           example: 20000000
 *         tags:
 *           type: array
 *           description: Danh sách tag kỹ năng/sở thích đã được chuẩn hoá và gán vào hồ sơ
 *           items:
 *             $ref: '#/components/schemas/TagLite'
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-27T09:01:00.000Z
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-20T12:00:00.000Z
 *
 *     CareerPreferenceUpsertRequest:
 *       type: object
 *       properties:
 *         desired_title:
 *           type: string
 *           example: "Backend Developer"
 *         desired_company:
 *           type: string
 *           example: "Tech Unicorn VN"
 *         desired_location:
 *           type: string
 *           example: "TP.HCM"
 *         desired_salary:
 *           type: number
 *           description: Mức lương mong muốn (USD hoặc VND quy đổi tùy business rule)
 *           example: 20000000
 *         tags:
 *           type: array
 *           description: Danh sách tag ở dạng chuỗi, service sẽ upsert Tag và gán bảng nối
 *           items:
 *             type: string
 *           example: ["Node.js", "PostgreSQL", "AWS"]
 *
 *     CareerPreferenceUpsertResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Lưu tiêu chí nghề nghiệp thành công!"
 *         data:
 *           $ref: '#/components/schemas/CareerPreference'
 */

/**
 * @swagger
 * /api/preferences/career-preference:
 *   get:
 *     summary: Lấy tiêu chí nghề nghiệp của chính người dùng hiện tại
 *     description: Dựa trên JWT, trả về hồ sơ Career Preference. Có thể rỗng nếu người dùng chưa thiết lập.
 *     tags: [Career Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về đối tượng tiêu chí nghề nghiệp (hoặc `{}` nếu chưa có)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CareerPreference'
 *                 - type: object
 *                   example: {}
 *             examples:
 *               empty:
 *                 summary: Chưa thiết lập
 *                 value: {}
 *               filled:
 *                 summary: Đã có dữ liệu
 *                 value:
 *                   user_id: "5"
 *                   desired_title: "Backend Developer"
 *                   desired_company: "Tech Unicorn VN"
 *                   desired_location: "TP.HCM"
 *                   desired_salary: 20000000
 *                   tags:
 *                     - { "id": 10, "name": "Node.js" }
 *                     - { "id": 11, "name": "PostgreSQL" }
 *                     - { "id": 12, "name": "AWS" }
 *                   updated_at: "2025-10-27T09:01:00.000Z"
 *                   created_at: "2025-10-20T12:00:00.000Z"
 *       401:
 *         description: Thiếu hoặc sai token
 *       500:
 *         description: Lỗi server
 *
 *   put:
 *     summary: Tạo mới/cập nhật tiêu chí nghề nghiệp của chính người dùng
 *     description: Upsert theo user_id trong JWT. Service sẽ tự chuẩn hoá và upsert Tag, sau đó cập nhật bảng nối.
 *     tags: [Career Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CareerPreferenceUpsertRequest'
 *           examples:
 *             basic:
 *               summary: Yêu cầu đầy đủ trường
 *               value:
 *                 desired_title: "Backend Developer"
 *                 desired_company: "Tech Unicorn VN"
 *                 desired_location: "TP.HCM"
 *                 desired_salary: 20000000
 *                 tags: ["Node.js", "PostgreSQL", "AWS"]
 *             minimal:
 *               summary: Cập nhật một phần
 *               value:
 *                 desired_title: "Software Engineer"
 *                 tags: ["JavaScript"]
 *     responses:
 *       200:
 *         description: Lưu thành công và trả lại đối tượng đã cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CareerPreferenceUpsertResponse'
 *             examples:
 *               ok:
 *                 summary: Lưu thành công
 *                 value:
 *                   message: "Lưu tiêu chí nghề nghiệp thành công!"
 *                   data:
 *                     user_id: "5"
 *                     desired_title: "Backend Developer"
 *                     desired_company: "Tech Unicorn VN"
 *                     desired_location: "TP.HCM"
 *                     desired_salary: 20000000
 *                     tags:
 *                       - { "id": 10, "name": "Node.js" }
 *                       - { "id": 11, "name": "PostgreSQL" }
 *                       - { "id": 12, "name": "AWS" }
 *                     updated_at: "2025-10-27T09:01:00.000Z"
 *                     created_at: "2025-10-27T09:01:00.000Z"
 *       401:
 *         description: Thiếu hoặc sai token
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * tags:
 *   - name: Recruiter Preferences
 *     description: Tiêu chí tuyển dụng của nhà tuyển dụng (nhà tuyển dụng)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SkillRequirement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID kỹ năng (sau khi upsert)
 *           example: 8
 *         name:
 *           type: string
 *           example: "AWS"
 *         years_required:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         must_have:
 *           type: boolean
 *           example: true
 *
 *     RecruiterPreference:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           example: "12"
 *         desired_location:
 *           type: string
 *           nullable: true
 *           example: "Hà Nội"
 *         desired_salary_avg:
 *           type: number
 *           nullable: true
 *           example: 15000000
 *         desired_tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TagLite'
 *         required_skills:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SkillRequirement'
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2025-10-27T09:12:00.000Z
 *
 *     RecruiterPreferenceUpsertRequest:
 *       type: object
 *       properties:
 *         desired_location:
 *           type: string
 *           example: "Hà Nội"
 *         desired_salary_avg:
 *           type: number
 *           example: 15000000
 *         desired_tags:
 *           type: array
 *           description: Mảng tên tag; service sẽ upsert Tag và THAY THẾ toàn bộ set hiện có
 *           items:
 *             type: string
 *           example: ["ReactJS", "Node.js"]
 *         required_skills:
 *           type: array
 *           description: Danh sách kỹ năng yêu cầu; service sẽ upsert Skill và THAY THẾ toàn bộ set hiện có
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "JavaScript"
 *               years_required:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               must_have:
 *                 type: boolean
 *                 example: true
 *
 *     RecruiterPreferenceUpsertResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Lưu tiêu chí nhà tuyển dụng thành công"
 *         data:
 *           $ref: '#/components/schemas/RecruiterPreference'
 */

/**
 * @swagger
 * /api/preferences/recruiter:
 *   get:
 *     summary: Lấy tiêu chí tuyển dụng của chính nhà tuyển dụng
 *     description: Chỉ dành cho user có role recruiter hoặc admin. Trả về `{}` nếu chưa thiết lập.
 *     tags: [Recruiter Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đối tượng tiêu chí tuyển dụng (hoặc `{}` nếu chưa có)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/RecruiterPreference'
 *                 - type: object
 *                   example: {}
 *             examples:
 *               empty:
 *                 summary: Chưa thiết lập
 *                 value: {}
 *               filled:
 *                 summary: Đã có dữ liệu
 *                 value:
 *                   user_id: "12"
 *                   desired_location: "Hà Nội"
 *                   desired_salary_avg: 15000000
 *                   desired_tags:
 *                     - { "id": 3, "name": "ReactJS" }
 *                     - { "id": 7, "name": "Node.js" }
 *                   required_skills:
 *                     - { "id": 2, "name": "JavaScript", "years_required": 2, "must_have": true }
 *                     - { "id": 8, "name": "AWS", "years_required": 1, "must_have": false }
 *                   updated_at: "2025-10-27T09:12:00.000Z"
 *       403:
 *         description: Chỉ nhà tuyển dụng hoặc admin!
 *       401:
 *         description: Thiếu/sai token
 *       500:
 *         description: Lỗi server
 *
 *   put:
 *     summary: Tạo mới/Cập nhật tiêu chí tuyển dụng của nhà tuyển dụng
 *     description: Upsert theo user_id trong JWT. Thay thế toàn bộ desired_tags và required_skills nếu truyền lên.
 *     tags: [Recruiter Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecruiterPreferenceUpsertRequest'
 *           examples:
 *             full:
 *               summary: Payload đầy đủ
 *               value:
 *                 desired_location: "Hà Nội"
 *                 desired_salary_avg: 15000000
 *                 desired_tags: ["ReactJS", "Node.js"]
 *                 required_skills:
 *                   - { "name": "JavaScript", "years_required": 2, "must_have": true }
 *                   - { "name": "AWS", "years_required": 1, "must_have": false }
 *             partial:
 *               summary: Cập nhật một phần
 *               value:
 *                 desired_location: "TP.HCM"
 *                 desired_tags: ["Golang"]
 *     responses:
 *       200:
 *         description: Lưu thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecruiterPreferenceUpsertResponse'
 *             examples:
 *               ok:
 *                 summary: Thành công
 *                 value:
 *                   message: "Lưu tiêu chí nhà tuyển dụng thành công"
 *                   data:
 *                     user_id: "12"
 *                     desired_location: "Hà Nội"
 *                     desired_salary_avg: 15000000
 *                     desired_tags:
 *                       - { "id": 3, "name": "ReactJS" }
 *                       - { "id": 7, "name": "Node.js" }
 *                     required_skills:
 *                       - { "id": 2, "name": "JavaScript", "years_required": 2, "must_have": true }
 *                       - { "id": 8, "name": "AWS", "years_required": 1, "must_have": false }
 *                     updated_at: "2025-10-27T09:12:00.000Z"
 *       403:
 *         description: Chỉ nhà tuyển dụng hoặc admin!
 *       401:
 *         description: Thiếu/sai token
 *       500:
 *         description: Lỗi server
 */
