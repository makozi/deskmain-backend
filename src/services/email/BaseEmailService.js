/**
 * Abstract base class for email services
 * All email providers must implement these methods
 */
class BaseEmailService {
  /**
   * Send single email
   * @param {Object} options - Email options
   * @param {String} options.to - Recipient email
   * @param {String} options.subject - Email subject
   * @param {String} options.htmlBody - HTML email body
   * @param {String} options.textBody - Plain text email body
   * @param {Array} options.cc - CC recipients
   * @param {Array} options.bcc - BCC recipients
   * @param {Array} options.attachments - Email attachments
   * @returns {Promise<Object>} - Send result with message ID
   */
  async sendEmail(options) {
    throw new Error('sendEmail must be implemented');
  }

  /**
   * Send batch emails
   * @param {Array} recipients - Array of recipient objects
   * @param {String} subject - Email subject
   * @param {String} htmlTemplate - HTML template
   * @param {String} textTemplate - Text template
   * @returns {Promise<Object>} - Batch send result
   */
  async sendBatch(recipients, subject, htmlTemplate, textTemplate) {
    throw new Error('sendBatch must be implemented');
  }

  /**
   * Send email from template
   * @param {String} templateId - Template ID in service
   * @param {Object} recipient - Recipient email and variables
   * @param {Object} variables - Template variables
   * @returns {Promise<Object>} - Send result with message ID
   */
  async sendFromTemplate(templateId, recipient, variables) {
    throw new Error('sendFromTemplate must be implemented');
  }

  /**
   * Create email template
   * @param {Object} template - Template data
   * @returns {Promise<Object>} - Created template info
   */
  async createTemplate(template) {
    throw new Error('createTemplate must be implemented');
  }

  /**
   * Get email stats
   * @param {Object} filters - Filters for stats
   * @returns {Promise<Object>} - Email statistics
   */
  async getStats(filters = {}) {
    throw new Error('getStats must be implemented');
  }

  /**
   * Handle webhook event
   * @param {Object} event - Webhook event data
   * @returns {Promise<Boolean>} - Event processed successfully
   */
  async handleWebhook(event) {
    throw new Error('handleWebhook must be implemented');
  }

  /**
   * Verify email address
   * @param {String} email - Email to verify
   * @returns {Promise<Boolean>} - Is valid email
   */
  async verifyEmail(email) {
    throw new Error('verifyEmail must be implemented');
  }

  /**
   * Add email to suppression list
   * @param {String} email - Email to suppress
   * @param {String} reason - Reason for suppression
   * @returns {Promise<Boolean>} - Success status
   */
  async suppressEmail(email, reason = 'bounced') {
    throw new Error('suppressEmail must be implemented');
  }

  /**
   * Remove email from suppression list
   * @param {String} email - Email to unsuppress
   * @returns {Promise<Boolean>} - Success status
   */
  async unsuppressEmail(email) {
    throw new Error('unsuppressEmail must be implemented');
  }
}

module.exports = BaseEmailService;
