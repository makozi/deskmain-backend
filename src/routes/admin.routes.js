import express from 'express';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/merchants:
 *   get:
 *     summary: List all merchants
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchants list
 */
router.get('/merchants', verifyAdmin, async (req, res) => res.json({ merchants: [] }));

/**
 * @swagger
 * /api/v1/admin/merchants/{id}/approve-kyc:
 *   post:
 *     summary: Approve merchant KYC
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: KYC approved
 */
router.post('/merchants/:id/approve-kyc', verifyAdmin, async (req, res) => {
  res.json({ message: 'KYC approved' });
});

/**
 * @swagger
 * /api/v1/admin/merchants/{id}/reject-kyc:
 *   post:
 *     summary: Reject merchant KYC
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: KYC rejected
 */
router.post('/merchants/:id/reject-kyc', verifyAdmin, async (req, res) => {
  res.json({ message: 'KYC rejected' });
});

/**
 * @swagger
 * /api/v1/admin/disputes:
 *   get:
 *     summary: List disputes
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Disputes list
 */
router.get('/disputes', verifyAdmin, async (req, res) => res.json({ disputes: [] }));

/**
 * @swagger
 * /api/v1/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs
 */
router.get('/audit-logs', verifyAdmin, async (req, res) => res.json({ logs: [] }));

/**
 * @swagger
 * /api/v1/admin/analytics:
 *   get:
 *     summary: Get platform analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/analytics', verifyAdmin, async (req, res) => {
  res.json({ gmv: 0, merchants: 0, transactions: 0 });
});

export default router;
