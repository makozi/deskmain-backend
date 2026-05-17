const axios = require('axios');
const { EventEmitter } = require('events');
const BaseEmailService = require('./BaseEmailService');
const logger = require('../../config/logger');

/**
 * Brevo (Sendinblue) Email Service
 */
class BrevoService extends BaseEmailService {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.baseURL = 'https://api.brevo.com/v3';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    this.fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@deskmain.io';
    this.fromName = process.env.BREVO_FROM_NAME || 'DeskMain';
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Send single email
   */
  async sendEmail(options) {
    try {
      const {
        to,
        subject,
        htmlBody,
        textBody,
        cc = [],
        bcc = [],
        attachments = [],
        from = this.fromEmail,
        fromName = this.fromName,
      } = options;

      const emailRequest = {
        sender: { name: fromName, email: from },
        to: [{ email: to }],
        subject,
        htmlContent: htmlBody,
        textContent: textBody,
      };

      if (cc.length > 0) {
        emailRequest.cc = cc.map((email) => ({ email }));
      }

      if (bcc.length > 0) {
        emailRequest.bcc = bcc.map((email) => ({ email }));
      }

      if (attachments.length > 0) {
        emailRequest.attachment = attachments.map((att) => ({
          content: att.content,
          name: att.filename,
        }));
      }

      const response = await this.client.post('/smtp/email', emailRequest);

      logger.info(`Email sent to ${to}: ${subject}`);
      this.eventEmitter.emit('email:sent', { to, subject, messageId: response.data.messageId });

      return {
        messageId: response.data.messageId,
        status: 'sent',
      };
    } catch (error) {
      logger.error(`Brevo send failed to ${options.to}:`, error);
      this.eventEmitter.emit('email:failed', { to: options.to, error: error.message });
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  /**
   * Send batch emails
   */
  async sendBatch(recipients, subject, htmlTemplate, textTemplate) {
    try {
      const emailRequest = {
        sender: { name: this.fromName, email: this.fromEmail },
        subject,
        htmlContent: htmlTemplate,
        textContent: textTemplate,
        messageVersionId: 1,
      };

      // Brevo batch send typically uses lists or scheduled sends
      let sentCount = 0;

      for (const recipient of recipients) {
        emailRequest.to = [{ email: recipient.email }];
        try {
          await this.client.post('/smtp/email', emailRequest);
          sentCount++;
        } catch (error) {
          logger.error(`Failed to send to ${recipient.email}:`, error);
        }
      }

      logger.info(`Batch email sent to ${sentCount}/${recipients.length} recipients`);
      this.eventEmitter.emit('email:batch-sent', { count: sentCount, subject });

      return {
        status: 'sent',
        recipientCount: sentCount,
        totalRecipients: recipients.length,
      };
    } catch (error) {
      logger.error('Brevo batch send failed:', error);
      throw new Error(`Batch send failed: ${error.message}`);
    }
  }

  /**
   * Send from template
   */
  async sendFromTemplate(templateId, recipient, variables) {
    try {
      const emailRequest = {
        sender: { name: this.fromName, email: this.fromEmail },
        to: [{ email: recipient.email }],
        templateId: parseInt(templateId),
        params: variables,
      };

      const response = await this.client.post('/smtp/email', emailRequest);

      logger.info(`Template email sent to ${recipient.email}: ${templateId}`);
      this.eventEmitter.emit('email:template-sent', { to: recipient.email, templateId });

      return {
        messageId: response.data.messageId,
        status: 'sent',
      };
    } catch (error) {
      logger.error(`Brevo template send failed to ${recipient.email}:`, error);
      throw new Error(`Template send failed: ${error.message}`);
    }
  }

  /**
   * Create template
   */
  async createTemplate(template) {
    try {
      const templateRequest = {
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlBody,
        sender: {
          name: this.fromName,
          email: this.fromEmail,
        },
        replyTo: template.replyTo || this.fromEmail,
        isActive: true,
      };

      const response = await this.client.post('/smtp/templates', templateRequest);

      logger.info(`Template created: ${template.name}`);
      this.eventEmitter.emit('email:template-created', { templateId: response.data.id });

      return {
        templateId: response.data.id,
        name: template.name,
        status: 'created',
      };
    } catch (error) {
      logger.error('Template creation failed:', error);
      throw new Error(`Template creation failed: ${error.message}`);
    }
  }

  /**
   * Get email stats
   */
  async getStats(filters = {}) {
    try {
      const response = await this.client.get('/smtp/statistics', { params: filters });

      return {
        totalSent: response.data.stats?.[0]?.sent || 0,
        totalOpened: response.data.stats?.[0]?.unique_open || 0,
        totalClicked: response.data.stats?.[0]?.unique_click || 0,
        totalBounced: response.data.stats?.[0]?.bounces || 0,
        totalDelivered: response.data.stats?.[0]?.delivered || 0,
      };
    } catch (error) {
      logger.error('Failed to get stats:', error);
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  /**
   * Handle webhook
   */
  async handleWebhook(event) {
    try {
      const { event: eventType, email, timestamp } = event;

      logger.info(`Webhook event received: ${eventType} for ${email}`);
      this.eventEmitter.emit(`webhook:${eventType}`, { email, timestamp, event });

      return true;
    } catch (error) {
      logger.error('Webhook handling failed:', error);
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(email) {
    try {
      const response = await this.client.get(`/contacts/${email}`);
      return response.status === 200;
    } catch (error) {
      if (error.response?.status === 404) {
        return false; // Email not in Brevo
      }
      logger.error(`Email verification failed for ${email}:`, error);
      return false;
    }
  }

  /**
   * Suppress email
   */
  async suppressEmail(email, reason = 'bounced') {
    try {
      const suppressRequest = {
        blacklistSender: [{ email }],
      };

      await this.client.post('/contacts/blacklist', suppressRequest);

      logger.info(`Email suppressed: ${email} (${reason})`);
      this.eventEmitter.emit('email:suppressed', { email, reason });

      return true;
    } catch (error) {
      logger.error(`Email suppression failed for ${email}:`, error);
      throw new Error(`Email suppression failed: ${error.message}`);
    }
  }

  /**
   * Unsuppress email
   */
  async unsuppressEmail(email) {
    try {
      const unsuppressRequest = {
        unblacklistSender: [{ email }],
      };

      await this.client.post('/contacts/blacklist', unsuppressRequest);

      logger.info(`Email unsuppressed: ${email}`);
      this.eventEmitter.emit('email:unsuppressed', { email });

      return true;
    } catch (error) {
      logger.error(`Email unsuppression failed for ${email}:`, error);
      throw new Error(`Email unsuppression failed: ${error.message}`);
    }
  }

  /**
   * Listen to email events
   */
  onEmailEvent(eventType, callback) {
    this.eventEmitter.on(eventType, callback);
  }

  /**
   * Remove email event listener
   */
  offEmailEvent(eventType, callback) {
    this.eventEmitter.off(eventType, callback);
  }
}

module.exports = BrevoService;
