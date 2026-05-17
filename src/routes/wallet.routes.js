import express from 'express';
import { verifyMerchant } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance
 */
router.get('/balance', verifyMerchant, async (req, res) => {
  res.json({ balance: 0, available: 0, pending: 0, reserved: 0 });
});

/**
 * @swagger
 * /api/v1/wallet/transactions:
 *   get:
 *     summary: Get transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history
 */
router.get('/transactions', verifyMerchant, async (req, res) => {
  res.json({ transactions: [] });
});

/**
 * @swagger
 * /api/v1/wallet/deposit:
 *   post:
 *     summary: Deposit to wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deposit successful
 */
router.post('/deposit', verifyMerchant, async (req, res) => {
  res.json({ message: 'Deposit successful' });
});

export default router;
