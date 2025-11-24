/**
 * @swagger
 * tags:
 *   - name: BehaviorProfile
 *     description: Hồ sơ hành vi người dùng – dữ liệu nền cho hệ thống đề xuất
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
 *     BehaviorTag:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "node.js"
 *         weight:
 *           type: number
 *           format: float
 *           example: 0.92
 *
 *     BehaviorProfile:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           example: "5"
 *         avg_salary:
 *           type: integer
 *           example: 28000000
 *         main_location:
 *           type: string
 *           example: "Hà Nội"
 *         tags:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/BehaviorTag"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-11-01T10:15:00.000Z"
 */

/**
 * @swagger
 * /api/users/behavior-profile:
 *   get:
 *     summary: Lấy hồ sơ hành vi (Behavior Profile) của người dùng hiện tại
 *     description: |
 *       Trả về dữ liệu hồ sơ hành vi của người dùng, bao gồm **tags**, **địa điểm chính**, và **mức lương trung bình**.
 *       Dữ liệu này được hệ thống tính toán tự động dựa trên bảng `user_interest_history` và `career_preferences`.
 *     tags: [BehaviorProfile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hồ sơ hành vi hiện tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BehaviorProfile"
 *       401:
 *         description: Thiếu hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/users/behavior-profile/rebuild:
 *   post:
 *     summary: Cập nhật lại (rebuild) hồ sơ hành vi người dùng
 *     description: |
 *       Thực hiện tính toán lại toàn bộ hồ sơ hành vi (`user_behavior_profile`) cho người dùng hiện tại.
 *       API này sẽ đọc dữ liệu từ bảng **user_interest_history** và **career_preferences**,
 *       sau đó cập nhật lại `avg_salary`, `main_location`, và `tags` trong bảng `user_behavior_profile`.
 *
 *       - Chỉ dành cho user đã đăng nhập (token bắt buộc).
 *       - Thường dùng khi bạn muốn đồng bộ thủ công hoặc test nhanh quá trình tính toán trước khi gọi API gợi ý công việc.
 *     tags: [BehaviorProfile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hồ sơ hành vi được rebuild thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "rebuilt"
 *                 result:
 *                   $ref: "#/components/schemas/BehaviorProfile"
 *       401:
 *         description: Thiếu hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không có token, truy cập bị từ chối!"
 *       500:
 *         description: Lỗi server khi rebuild hồ sơ hành vi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi server!"
 */
