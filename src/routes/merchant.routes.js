import express from 'express';
import { verifyMerchant } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/merchants:
 *   post:
 *     summary: Create merchant account
 *     tags: [Merchants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               store_name: { type: string }
 *               business_type: { type: string }
 *     responses:
 *       201:
 *         description: Merchant created
 */
router.post('/', async (req, res) => res.status(201).json({ message: 'Merchant created' }));

/**
 * @swagger
 * /api/v1/merchants/{id}:
 *   get:
 *     summary: Get merchant details
 *     tags: [Merchants]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Merchant details
 */
router.get('/:id', async (req, res) => res.json({ merchant: 'details here' }));

/**
 * @swagger
 * /api/v1/merchants/{id}:
 *   put:
 *     summary: Update merchant profile
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Merchant updated
 */
router.put('/:id', verifyMerchant, async (req, res) => res.json({ message: 'Merchant updated' }));

/**
 * @swagger
 * /api/v1/merchants/{id}/kyc:
 *   post:
 *     summary: Submit KYC verification
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: KYC submitted
 */
router.post('/:id/kyc', verifyMerchant, async (req, res) => res.json({ message: 'KYC submitted' }));

/**
 * @swagger
 * /api/v1/merchants/{id}/dashboard:
 *   get:
 *     summary: Get merchant dashboard data
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/:id/dashboard', verifyMerchant, async (req, res) => {
  res.json({ sales: 0, orders: 0, revenue: 0, products: 0 });
});

/**
 * @swagger
 * /api/v1/merchants/{id}/team:
 *   get:
 *     summary: Get team members
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Team members list
 */
router.get('/:id/team', verifyMerchant, async (req, res) => res.json({ team: [] }));

/**
 * @swagger
 * /api/v1/merchants/{id}/team:
 *   post:
 *     summary: Invite team member
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Team member invited
 */
router.post('/:id/team', verifyMerchant, async (req, res) => {
  res.status(201).json({ message: 'Team member invited' });
});

export default router;
