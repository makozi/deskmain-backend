import express from 'express';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Create product review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id: { type: string }
 *               rating: { type: integer }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Review created
 */
router.post('/', verifyToken, async (req, res) => {
  res.status(201).json({ message: 'Review created', review_id: 'id' });
});

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete('/:id', verifyToken, async (req, res) => {
  res.json({ message: 'Review deleted' });
});

export default router;
