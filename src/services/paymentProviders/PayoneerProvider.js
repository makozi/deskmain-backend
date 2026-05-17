const axios = require('axios');
const crypto = require('crypto');

/**
 * Payoneer Payment Provider
 * Handles payments via Payoneer API
 */
class PayoneerProvider {
  constructor(apiKey, secret) {
    this.apiKey = apiKey;
    this.secret = secret;
    this.baseURL = 'https://api.payoneer.com/v2';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initialize payment via Payoneer
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} - Payment reference and redirect URL
   */
  async initializePayment(paymentData) {
    try {
      const {
        amount,
        currency,
        description,
        customerId,
        email,
        firstName,
        lastName,
        redirectUrl,
        webhookUrl,
      } = paymentData;

      const paymentRequest = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || 'USD',
        description,
        customer: {
          id: customerId,
          email,
          firstName,
          lastName,
        },
        redirectUrl,
        webhookUrl,
        paymentMethods: ['card', 'paypal', 'bank_transfer'],
      };

      const response = await this.client.post('/payments', paymentRequest);

      return {
        reference: response.data.id,
        redirectUrl: response.data.redirectUrl,
        status: response.data.status,
      };
    } catch (error) {
      throw new Error(`Payoneer initialization failed: ${error.message}`);
    }
  }

  /**
   * Verify payment status
   * @param {String} reference - Payment reference
   * @returns {Promise<Object>} - Payment status and details
   */
  async verifyPayment(reference) {
    try {
      const response = await this.client.get(`/payments/${reference}`);

      return {
        status: response.data.status,
        amount: response.data.amount / 100,
        currency: response.data.currency,
        reference: response.data.id,
        customerId: response.data.customer?.id,
        createdAt: response.data.createdAt,
        confirmedAt: response.data.confirmedAt,
      };
    } catch (error) {
      throw new Error(`Payoneer verification failed: ${error.message}`);
    }
  }

  /**
   * Create payout to Payoneer account
   * @param {Object} payoutData - Payout details
   * @returns {Promise<Object>} - Payout reference and status
   */
  async createPayout(payoutData) {
    try {
      const {
        amount,
        currency,
        payoneerEmail,
        description,
        payoutId,
      } = payoutData;

      const payoutRequest = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || 'USD',
        recipient: {
          email: payoneerEmail,
        },
        description,
        externalId: payoutId,
      };

      const response = await this.client.post('/payouts', payoutRequest);

      return {
        reference: response.data.id,
        status: response.data.status,
        amount: response.data.amount / 100,
        currency: response.data.currency,
      };
    } catch (error) {
      throw new Error(`Payoneer payout failed: ${error.message}`);
    }
  }

  /**
   * Get FX rates
   * @param {String} fromCurrency - Source currency
   * @param {String} toCurrency - Target currency
   * @returns {Promise<Number>} - Exchange rate
   */
  async getFXRate(fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) return 1.0;

      const response = await this.client.get('/rates', {
        params: {
          from: fromCurrency,
          to: toCurrency,
        },
      });

      return response.data.rate || 1.0;
    } catch (error) {
      throw new Error(`Payoneer FX rate failed: ${error.message}`);
    }
  }

  /**
   * Process refund
   * @param {String} transactionId - Original transaction ID
   * @param {Number} amount - Refund amount
   * @returns {Promise<Object>} - Refund status
   */
  async refund(transactionId, amount) {
    try {
      const refundRequest = {
        paymentId: transactionId,
        amount: Math.round(amount * 100), // Convert to cents
      };

      const response = await this.client.post('/refunds', refundRequest);

      return {
        reference: response.data.id,
        status: response.data.status,
        amount: response.data.amount / 100,
      };
    } catch (error) {
      throw new Error(`Payoneer refund failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * @param {String} payload - Webhook payload
   * @param {String} signature - Webhook signature
   * @returns {Boolean} - Signature validity
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const hash = crypto
        .createHmac('sha256', this.secret)
        .update(payload)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      return false;
    }
  }
}

module.exports = PayoneerProvider;
