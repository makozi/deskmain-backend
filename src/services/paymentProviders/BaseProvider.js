/**
 * Abstract base class for payment providers
 * All providers must implement these methods
 */
class BasePaymentProvider {
  constructor(apiKey, secret) {
    this.apiKey = apiKey;
    this.secret = secret;
  }

  /**
   * Initialize payment
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} - Payment reference and redirect URL
   */
  async initializePayment(paymentData) {
    throw new Error('initializePayment must be implemented');
  }

  /**
   * Verify payment
   * @param {String} reference - Payment reference
   * @returns {Promise<Object>} - Payment status and details
   */
  async verifyPayment(reference) {
    throw new Error('verifyPayment must be implemented');
  }

  /**
   * Create payout
   * @param {Object} payoutData - Payout details
   * @returns {Promise<Object>} - Payout reference and status
   */
  async createPayout(payoutData) {
    throw new Error('createPayout must be implemented');
  }

  /**
   * Get FX rates
   * @param {String} fromCurrency - Source currency
   * @param {String} toCurrency - Target currency
   * @returns {Promise<Number>} - Exchange rate
   */
  async getFXRate(fromCurrency, toCurrency) {
    throw new Error('getFXRate must be implemented');
  }

  /**
   * Process refund
   * @param {String} transactionId - Original transaction ID
   * @param {Number} amount - Refund amount
   * @returns {Promise<Object>} - Refund status
   */
  async refund(transactionId, amount) {
    throw new Error('refund must be implemented');
  }

  /**
   * Verify webhook signature
   * @param {String} payload - Webhook payload
   * @param {String} signature - Webhook signature
   * @returns {Boolean} - Signature validity
   */
  verifyWebhookSignature(payload, signature) {
    throw new Error('verifyWebhookSignature must be implemented');
  }
}

module.exports = BasePaymentProvider;
