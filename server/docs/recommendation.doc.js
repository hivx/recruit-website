/**
 * @swagger
 * /api/recommendations/{userId}:
 *   get:
 *     summary: Sinh gợi ý công việc cho người dùng
 *     description: |
 *       Dựa vào vector của user + vector của job, tính fit_score theo thuật toán của bạn.
 *       Sau đó **upsert** vào bảng job_recommendations và trả về kết quả.
 *     tags:
 *       - Job Recommendations
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
