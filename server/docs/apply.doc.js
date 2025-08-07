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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - coverLetter
 *               - phone
 *               - cv
 *             properties:
 *               jobId:
 *                 type: string
 *                 example: 64f0cabc1234567890abcdef
 *               coverLetter:
 *                 type: string
 *                 example: Tôi rất quan tâm tới vị trí này và tin rằng mình phù hợp...
 *               cv:
 *                 type: string
 *                 format: binary
 *               phone:
 *                 type: string
 *                 example: 0987654321
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
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       403:
 *         description: Chỉ ứng viên (applicant or admin) mới có thể ứng tuyển
 *       404:
 *         description: Không tìm thấy công việc với ID đã cung cấp
 */

/**
 * @swagger
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: Lấy danh sách ứng viên đã ứng tuyển vào công việc
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         description: ID công việc
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách ứng viên đã ứng tuyển vào công việc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalApplicants:
 *                   type: number
 *                   example: 5
 *                 applicants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       applicantName:
 *                         type: string
 *                       applicantEmail:
 *                         type: string
 *                       coverLetter:
 *                         type: string
 *                       cv:
 *                         type: string
 *                         description: Đường dẫn tới CV của ứng viên
 *                       phone:
 *                         type: string
 *                         description: Số điện thoại của ứng viên
 *                       appliedAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Không tìm thấy ứng viên
 *       500:
 *         description: Lỗi server khi lấy danh sách ứng viên
 */
