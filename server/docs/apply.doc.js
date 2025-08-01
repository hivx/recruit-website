/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Ứng tuyển vào công việc
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ứng tuyển thành công
 *       400:
 *         description: Đã ứng tuyển trước đó
 *       404:
 *         description: Công việc không tồn tại
 */