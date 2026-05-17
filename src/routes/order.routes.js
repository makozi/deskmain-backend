import express from 'express';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', verifyToken, async (req, res) => res.json({ orders: [] }));

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', verifyToken, async (req, res) => res.json({ order: 'details' }));

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items: { type: array }
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', verifyToken, async (req, res) => {
  res.status(201).json({ message: 'Order created', order_id: 'id' });
});

/**
 * @swagger
 * /api/v1/orders/{id}/refund:
 *   post:
 *     summary: Request refund
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Refund requested
 */
router.post('/:id/refund', verifyToken, async (req, res) => {
  res.json({ message: 'Refund requested' });
});

export default router;
