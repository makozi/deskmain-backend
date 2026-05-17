import express from 'express';
import { verifyMerchant } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/payouts:
 *   get:
 *     summary: Get payout history
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payout history
 */
router.get('/', verifyMerchant, async (req, res) => res.json({ payouts: [] }));

/**
 * @swagger
 * /api/v1/payouts:
 *   post:
 *     summary: Request payout
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               payout_method: { type: string }
 *     responses:
 *       201:
 *         description: Payout requested
 */
router.post('/', verifyMerchant, async (req, res) => {
  res.status(201).json({ message: 'Payout requested', payout_id: 'id' });
});

/**
 * @swagger
 * /api/v1/payouts/{id}:
 *   get:
 *     summary: Get payout details
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payout details
 */
router.get('/:id', verifyMerchant, async (req, res) => res.json({ payout: 'details' }));

/**
 * @swagger
 * /api/v1/payouts/bank-accounts:
 *   get:
 *     summary: Get bank accounts
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bank accounts
 */
router.get('/bank-accounts', verifyMerchant, async (req, res) => res.json({ accounts: [] }));

export default router;
