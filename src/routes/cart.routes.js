import express from 'express';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart contents
 */
router.get('/', verifyToken, async (req, res) => res.json({ items: [], total: 0 }));

/**
 * @swagger
 * /api/v1/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
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
 *               quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Item added
 */
router.post('/add', verifyToken, async (req, res) => res.json({ message: 'Item added' }));

/**
 * @swagger
 * /api/v1/cart/remove:
 *   post:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Item removed
 */
router.post('/remove', verifyToken, async (req, res) => res.json({ message: 'Item removed' }));

/**
 * @swagger
 * /api/v1/cart/clear:
 *   post:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.post('/clear', verifyToken, async (req, res) => res.json({ message: 'Cart cleared' }));

export default router;
