const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Email Templates
 *     description: Email template management
 *   - name: Email Subscribers
 *     description: Subscriber management
 *   - name: Email Campaigns
 *     description: Campaign management
 *   - name: Email Sequences
 *     description: Automated email sequences
 *   - name: Email Analytics
 *     description: Analytics and reporting
 */

// ============ EMAIL TEMPLATE ROUTES ============

/**
 * @swagger
 * /api/v1/email/templates:
 *   post:
 *     tags:
 *       - Email Templates
 *     summary: Create email template
 *     description: Create a new email template with HTML and text content
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, subject_line, html_content]
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               subject_line:
 *                 type: string
 *               html_content:
 *                 type: string
 *               plain_text_content:
 *                 type: string
 *               variables:
 *                 type: array
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template created successfully
 */
router.post('/templates', authMiddleware, emailController.createTemplate);

/**
 * @swagger
 * /api/v1/email/templates:
 *   get:
 *     tags:
 *       - Email Templates
 *     summary: Get all templates
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of templates
 */
router.get('/templates', emailController.getAllTemplates);

/**
 * @swagger
 * /api/v1/email/templates/{id}:
 *   get:
 *     tags:
 *       - Email Templates
 *     summary: Get template by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template details
 *       404:
 *         description: Template not found
 */
router.get('/templates/:id', emailController.getTemplate);

/**
 * @swagger
 * /api/v1/email/templates/{id}:
 *   put:
 *     tags:
 *       - Email Templates
 *     summary: Update template
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Template updated
 */
router.put('/templates/:id', authMiddleware, emailController.updateTemplate);

/**
 * @swagger
 * /api/v1/email/templates/{id}:
 *   delete:
 *     tags:
 *       - Email Templates
 *     summary: Delete template
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted
 */
router.delete('/templates/:id', authMiddleware, emailController.deleteTemplate);

// ============ EMAIL SUBSCRIBER ROUTES ============

/**
 * @swagger
 * /api/v1/email/subscribers:
 *   post:
 *     tags:
 *       - Email Subscribers
 *     summary: Subscribe email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               subscription_source:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully subscribed
 */
router.post('/subscribers', emailController.subscribeEmail);

/**
 * @swagger
 * /api/v1/email/subscribers:
 *   get:
 *     tags:
 *       - Email Subscribers
 *     summary: Get all subscribers
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subscribers
 */
router.get('/subscribers', emailController.getAllSubscribers);

/**
 * @swagger
 * /api/v1/email/subscribers/{email}:
 *   get:
 *     tags:
 *       - Email Subscribers
 *     summary: Get subscriber by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscriber details
 */
router.get('/subscribers/:email', emailController.getSubscriber);

/**
 * @swagger
 * /api/v1/email/subscribers/{email}/preferences:
 *   put:
 *     tags:
 *       - Email Subscribers
 *     summary: Update subscriber preferences
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.put('/subscribers/:email/preferences', emailController.updateSubscriberPreferences);

/**
 * @swagger
 * /api/v1/email/unsubscribe:
 *   post:
 *     tags:
 *       - Email Subscribers
 *     summary: Unsubscribe email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 */
router.post('/unsubscribe', emailController.unsubscribeEmail);

// ============ EMAIL CAMPAIGN ROUTES ============

/**
 * @swagger
 * /api/v1/email/campaigns:
 *   post:
 *     tags:
 *       - Email Campaigns
 *     summary: Create campaign
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, template_id, campaign_type]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               template_id:
 *                 type: string
 *               campaign_type:
 *                 type: string
 *               subject_line:
 *                 type: string
 *               from_name:
 *                 type: string
 *               from_email:
 *                 type: string
 *               reply_to:
 *                 type: string
 *               variables:
 *                 type: object
 *     responses:
 *       201:
 *         description: Campaign created
 */
router.post('/campaigns', authMiddleware, emailController.createCampaign);

/**
 * @swagger
 * /api/v1/email/campaigns:
 *   get:
 *     tags:
 *       - Email Campaigns
 *     summary: Get all campaigns
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: campaign_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of campaigns
 */
router.get('/campaigns', emailController.getAllCampaigns);

/**
 * @swagger
 * /api/v1/email/campaigns/{id}:
 *   get:
 *     tags:
 *       - Email Campaigns
 *     summary: Get campaign by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign details
 */
router.get('/campaigns/:id', emailController.getCampaign);

/**
 * @swagger
 * /api/v1/email/campaigns/{id}:
 *   put:
 *     tags:
 *       - Email Campaigns
 *     summary: Update campaign
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Campaign updated
 */
router.put('/campaigns/:id', authMiddleware, emailController.updateCampaign);

/**
 * @swagger
 * /api/v1/email/campaigns/{id}/schedule:
 *   post:
 *     tags:
 *       - Email Campaigns
 *     summary: Schedule campaign
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scheduled_at]
 *             properties:
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Campaign scheduled
 */
router.post('/campaigns/:id/schedule', authMiddleware, emailController.scheduleCampaign);

/**
 * @swagger
 * /api/v1/email/campaigns/{id}/send:
 *   post:
 *     tags:
 *       - Email Campaigns
 *     summary: Send campaign
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Campaign sent
 */
router.post('/campaigns/:id/send', authMiddleware, emailController.sendCampaign);

/**
 * @swagger
 * /api/v1/email/campaigns/{id}/stats:
 *   get:
 *     tags:
 *       - Email Campaigns
 *     summary: Get campaign statistics
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign statistics
 */
router.get('/campaigns/:id/stats', emailController.getCampaignStats);

/**
 * @swagger
 * /api/v1/email/campaigns/{id}:
 *   delete:
 *     tags:
 *       - Email Campaigns
 *     summary: Delete campaign
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign deleted
 */
router.delete('/campaigns/:id', authMiddleware, emailController.deleteCampaign);

// ============ EMAIL SEQUENCE ROUTES ============

/**
 * @swagger
 * /api/v1/email/sequences:
 *   post:
 *     tags:
 *       - Email Sequences
 *     summary: Create email sequence
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sequence_type]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               sequence_type:
 *                 type: string
 *               trigger_event:
 *                 type: string
 *               entry_criteria:
 *                 type: object
 *               exit_criteria:
 *                 type: object
 *               max_recipients_per_day:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sequence created
 */
router.post('/sequences', authMiddleware, emailController.createSequence);

/**
 * @swagger
 * /api/v1/email/sequences:
 *   get:
 *     tags:
 *       - Email Sequences
 *     summary: Get all sequences
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: sequence_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sequences
 */
router.get('/sequences', emailController.getAllSequences);

/**
 * @swagger
 * /api/v1/email/sequences/{id}:
 *   get:
 *     tags:
 *       - Email Sequences
 *     summary: Get sequence by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sequence details
 */
router.get('/sequences/:id', emailController.getSequence);

/**
 * @swagger
 * /api/v1/email/sequences/{id}/steps:
 *   post:
 *     tags:
 *       - Email Sequences
 *     summary: Add step to sequence
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [template_id, step_number]
 *             properties:
 *               template_id:
 *                 type: string
 *               step_number:
 *                 type: integer
 *               delay_value:
 *                 type: integer
 *               delay_unit:
 *                 type: string
 *               subject_override:
 *                 type: string
 *               conditions:
 *                 type: object
 *     responses:
 *       201:
 *         description: Step added
 */
router.post('/sequences/:id/steps', authMiddleware, emailController.addSequenceStep);

/**
 * @swagger
 * /api/v1/email/sequences/{id}/metrics:
 *   get:
 *     tags:
 *       - Email Sequences
 *     summary: Get sequence metrics
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sequence metrics
 */
router.get('/sequences/:id/metrics', emailController.getSequenceMetrics);

// ============ EMAIL ANALYTICS ROUTES ============

/**
 * @swagger
 * /api/v1/email/analytics/campaigns/{id}:
 *   get:
 *     tags:
 *       - Email Analytics
 *     summary: Get campaign analytics
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign analytics
 */
router.get('/analytics/campaigns/:id', emailController.getCampaignAnalytics);

/**
 * @swagger
 * /api/v1/email/analytics/subscribers/{id}:
 *   get:
 *     tags:
 *       - Email Analytics
 *     summary: Get subscriber engagement
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscriber engagement data
 */
router.get('/analytics/subscribers/:id', emailController.getSubscriberEngagement);

/**
 * @swagger
 * /api/v1/email/analytics/top-campaigns:
 *   get:
 *     tags:
 *       - Email Analytics
 *     summary: Get top performing campaigns
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Top campaigns
 */
router.get('/analytics/top-campaigns', emailController.getTopCampaigns);

module.exports = router;
