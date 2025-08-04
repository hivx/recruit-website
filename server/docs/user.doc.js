/**
 * @swagger
 * /api/users/favorite/{jobId}:
 *   post:
 *     summary: Thêm hoặc gỡ một job khỏi danh sách yêu thích
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài tuyển dụng
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */

/**
 * @swagger
 * /api/users/favorite:
 *   get:
 *     summary: Lấy danh sách các bài tuyển dụng yêu thích của người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bài tuyển dụng yêu thích
 */
