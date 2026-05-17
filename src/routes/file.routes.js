const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const fileController = require('../controllers/file.controller');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB
  },
});

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management operations
 */

/**
 * @swagger
 * /api/v1/files/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     url:
 *                       type: string
 *                     size:
 *                       type: number
 *       400:
 *         description: Upload failed
 *       401:
 *         description: Unauthorized
 */
router.post('/avatar', authenticateToken, upload.single('file'), fileController.uploadAvatar);

/**
 * @swagger
 * /api/v1/files/products/{productId}/images:
 *   post:
 *     summary: Upload product image
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product image uploaded successfully
 *       400:
 *         description: Upload failed
 *       401:
 *         description: Unauthorized
 */
router.post('/products/:productId/images', authenticateToken, upload.single('file'), fileController.uploadProductImage);

/**
 * @swagger
 * /api/v1/files/products/{productId}/files:
 *   post:
 *     summary: Upload product file (digital product)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product file uploaded successfully
 *       400:
 *         description: Upload failed
 *       401:
 *         description: Unauthorized
 */
router.post('/products/:productId/files', authenticateToken, upload.single('file'), fileController.uploadProductFile);

/**
 * @swagger
 * /api/v1/files/courses/{courseId}/materials:
 *   post:
 *     summary: Upload course material
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Course material uploaded successfully
 *       400:
 *         description: Upload failed
 *       401:
 *         description: Unauthorized
 */
router.post('/courses/:courseId/materials', authenticateToken, upload.single('file'), fileController.uploadCourseMaterial);

/**
 * @swagger
 * /api/v1/files/{fileId}/download:
 *   get:
 *     summary: Download file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download started
 *       404:
 *         description: File not found
 */
router.get('/:fileId/download', fileController.downloadFile);

/**
 * @swagger
 * /api/v1/files/{fileId}:
 *   get:
 *     summary: Get file details
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File retrieved successfully
 *       404:
 *         description: File not found
 */
router.get('/:fileId', fileController.getFile);

/**
 * @swagger
 * /api/v1/files/{fileId}:
 *   delete:
 *     summary: Delete file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:fileId', authenticateToken, fileController.deleteFile);

/**
 * @swagger
 * /api/v1/files/users/{userId}/avatar:
 *   get:
 *     summary: Get user avatar
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Avatar retrieved successfully
 *       404:
 *         description: Avatar not found
 */
router.get('/users/:userId/avatar', fileController.getUserAvatar);

/**
 * @swagger
 * /api/v1/files/products/{productId}/images:
 *   get:
 *     summary: Get product images
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product images retrieved successfully
 *       500:
 *         description: Failed to retrieve images
 */
router.get('/products/:productId/images', fileController.getProductImages);

/**
 * @swagger
 * /api/v1/files/products/{productId}/files:
 *   get:
 *     summary: Get product files
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product files retrieved successfully
 *       500:
 *         description: Failed to retrieve files
 */
router.get('/products/:productId/files', fileController.getProductFiles);

module.exports = router;
