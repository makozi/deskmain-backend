import express from 'express';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/affiliates/join:
 *   post:
 *     summary: Join affiliate program
 *     tags: [Affiliates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               merchant_id: { type: string }
 *     responses:
 *       201:
 *         description: Joined affiliate program
 */
router.post('/join', verifyToken, async (req, res) => {
  res.status(201).json({ message: 'Joined affiliate program', affiliate_id: 'id' });
});

/**
 * @swagger
 * /api/v1/affiliates/dashboard:
 *   get:
 *     summary: Affiliate dashboard
 *     tags: [Affiliates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/dashboard', verifyToken, async (req, res) => {
  res.json({ clicks: 0, conversions: 0, commission: 0 });
});

/**
 * @swagger
 * /api/v1/affiliates/commissions:
 *   get:
 *     summary: Get commissions
 *     tags: [Affiliates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commissions list
 */
router.get('/commissions', verifyToken, async (req, res) => res.json({ commissions: [] }));

/**
 * @swagger
 * /api/v1/affiliates/withdraw:
 *   post:
 *     summary: Withdraw commission
 *     tags: [Affiliates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Withdrawal processed
 */
router.post('/withdraw', verifyToken, async (req, res) => {
  res.json({ message: 'Withdrawal processed' });
});

export default router;
