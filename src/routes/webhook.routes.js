const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const { captureRawBody } = require('../middleware/webhookMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Webhooks
 *     description: Webhook endpoints for email service events
 */

/**
 * @swagger
 * /api/v1/webhooks/sendgrid:
 *   post:
 *     tags:
 *       - Webhooks
 *     summary: SendGrid email event webhook
 *     description: Receives and processes SendGrid email events (delivery, open, click, bounce, etc.)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 event:
 *                   type: string
 *                   enum: [delivered, open, click, bounce, dropped, spamreport, unsubscribe, group_unsubscribe]
 *                 email:
 *                   type: string
 *                 sg_message_id:
 *                   type: string
 *                 timestamp:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Events processed successfully
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         description: Internal server error
 */
router.post('/sendgrid', captureRawBody, webhookController.handleSendGridWebhook);

/**
 * @swagger
 * /api/v1/webhooks/status:
 *   get:
 *     tags:
 *       - Webhooks
 *     summary: Get webhook status
 *     description: Check if webhook is active and configured
 *     responses:
 *       200:
 *         description: Webhook status
 */
router.get('/status', webhookController.getWebhookStatus);

module.exports = router;
