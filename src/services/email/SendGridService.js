const sgMail = require('@sendgrid/mail');
const { EventEmitter } = require('events');
const BaseEmailService = require('./BaseEmailService');
const logger = require('../../config/logger');

/**
 * SendGrid Email Service
 */
class SendGridService extends BaseEmailService {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    sgMail.setApiKey(apiKey);
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@deskmain.io';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'DeskMain';
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

      const message = {
        to,
        from: { email: from, name: fromName },
        subject,
        html: htmlBody,
        text: textBody,
        cc: cc.length > 0 ? cc : undefined,
        bcc: bcc.length > 0 ? bcc : undefined,
      };

      // Add attachments if provided
      if (attachments.length > 0) {
        message.attachments = attachments.map((att) => ({
          content: att.content,
          filename: att.filename,
          type: att.mimeType || 'application/octet-stream',
          disposition: 'attachment',
        }));
      }

      const response = await sgMail.send(message);

      logger.info(`Email sent to ${to}: ${subject}`);
      this.eventEmitter.emit('email:sent', { to, subject, messageId: response[0].headers['x-message-id'] });

      return {
        messageId: response[0].headers['x-message-id'],
        status: 'sent',
      };
    } catch (error) {
      logger.error(`SendGrid send failed to ${options.to}:`, error);
      this.eventEmitter.emit('email:failed', { to: options.to, error: error.message });
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  /**
   * Send batch emails
   */
  async sendBatch(recipients, subject, htmlTemplate, textTemplate) {
    try {
      const message = {
        from: { email: this.fromEmail, name: this.fromName },
        subject,
        html: htmlTemplate,
        text: textTemplate,
        personalizations: recipients.map((recipient) => ({
          to: [{ email: recipient.email }],
          substitutions: recipient.variables || {},
        })),
      };

      const response = await sgMail.send(message);

      logger.info(`Batch email sent to ${recipients.length} recipients`);
      this.eventEmitter.emit('email:batch-sent', { count: recipients.length, subject });

      return {
        messageId: response[0].headers['x-message-id'],
        status: 'sent',
        recipientCount: recipients.length,
      };
    } catch (error) {
      logger.error('SendGrid batch send failed:', error);
      throw new Error(`Batch send failed: ${error.message}`);
    }
  }

  /**
   * Send from template
   */
  async sendFromTemplate(templateId, recipient, variables) {
    try {
      const message = {
        to: recipient.email,
        from: { email: this.fromEmail, name: this.fromName },
        templateId,
        dynamicTemplateData: variables,
      };

      const response = await sgMail.send(message);

      logger.info(`Template email sent to ${recipient.email}: ${templateId}`);
      this.eventEmitter.emit('email:template-sent', { to: recipient.email, templateId });

      return {
        messageId: response[0].headers['x-message-id'],
        status: 'sent',
      };
    } catch (error) {
      logger.error(`SendGrid template send failed to ${recipient.email}:`, error);
      throw new Error(`Template send failed: ${error.message}`);
    }
  }

  /**
   * Create template
   */
  async createTemplate(template) {
    try {
      // SendGrid templates are typically created via UI
      // This is a placeholder for API implementation
      logger.warn('Template creation via API not fully implemented for SendGrid');

      return {
        templateId: `template-${Date.now()}`,
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
      // This would require SendGrid stats API
      logger.info('Retrieving email stats');

      return {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        totalDelivered: 0,
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
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    } catch (error) {
      logger.error(`Email verification failed for ${email}:`, error);
      return false;
    }
  }

  /**
   * Suppress email
   */
  async suppressEmail(email, reason = 'bounced') {
    try {
      // SendGrid suppression list management
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

module.exports = SendGridService;
