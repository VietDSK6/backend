import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../config/upload';
import * as uploadController from './upload.controller';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload một file ảnh
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Thư mục Cloudinary (mặc định là "general")
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh cần upload (tối đa 5 MB)
 *     responses:
 *       200:
 *         description: Upload thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://res.cloudinary.com/..."
 *       400:
 *         description: Không có file hoặc file không hợp lệ
 *       401:
 *         description: Chưa xác thực
 */
router.post('/', upload.single('file'), uploadController.uploadFile);

export default router;
