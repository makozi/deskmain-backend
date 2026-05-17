const SendGridService = require('./SendGridService');
const BrevoService = require('./BrevoService');

/**
 * Email Service Factory
 * Creates and returns appropriate email service instance
 */
class EmailServiceFactory {
  static services = {
    sendgrid: SendGridService,
    brevo: BrevoService,
  };

  /**
   * Get email service instance
   * @param {String} providerName - Provider name (sendgrid, brevo)
   * @param {String} apiKey - Provider API key
   * @returns {Object} - Email service instance
   */
  static getService(providerName, apiKey) {
    const provider = (providerName || process.env.EMAIL_PROVIDER || 'sendgrid').toLowerCase();
    const key = apiKey || (provider === 'sendgrid' ? process.env.SENDGRID_API_KEY : process.env.BREVO_API_KEY);
    const ServiceClass = this.services[provider];

    if (!ServiceClass) {
      throw new Error(
        `Unknown email provider: ${provider}. Available: ${Object.keys(this.services).join(', ')}`
      );
    }

    if (!key) {
      throw new Error(`API key not provided for ${provider}`);
    }

    return new ServiceClass(key);
  }

  /**
   * Get list of supported providers
   * @returns {Array<String>} - Array of supported provider names
   */
  static getSupportedProviders() {
    return Object.keys(this.services);
  }

  /**
   * Register custom email service
   * @param {String} name - Provider name
   * @param {Class} ServiceClass - Service class extending BaseEmailService
   */
  static registerService(name, ServiceClass) {
    this.services[name.toLowerCase()] = ServiceClass;
  }
}

// Create default instance
const defaultEmailService = (() => {
  try {
    return EmailServiceFactory.getService();
  } catch (error) {
    console.warn('Email service not configured:', error.message);
    return null;
  }
})();

module.exports = {
  EmailServiceFactory,
  defaultEmailService,
};
