/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Ứng viên nộp đơn ứng tuyển vào một công việc
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 example: 64f0cabc1234567890abcdef
 *               coverLetter:
 *                 type: string
 *                 example: Tôi rất quan tâm tới vị trí này và tin rằng mình phù hợp...
 *     responses:
 *       201:
 *         description: Ứng tuyển thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ứng tuyển thành công
 *       400:
 *         description: Đã ứng tuyển trước đó hoặc dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bạn đã ứng tuyển công việc này rồi
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       403:
 *         description: Chỉ ứng viên (applicant or admin) mới có thể ứng tuyển
 *       404:
 *         description: Không tìm thấy công việc với ID đã cung cấp
 */
