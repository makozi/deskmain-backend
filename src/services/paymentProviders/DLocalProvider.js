const axios = require('axios');
const crypto = require('crypto');

/**
 * dLocal Payment Provider
 * Handles payments in emerging markets including Africa and Latin America
 */
class DLocalProvider {
  constructor(apiKey, secret) {
    this.apiKey = apiKey;
    this.secret = secret;
    this.baseURL = 'https://api.dlocal.com';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': () => crypto.randomUUID(),
      },
    });
  }

  /**
   * Initialize payment via dLocal
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} - Payment reference and details
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
        country,
        redirectUrl,
        webhookUrl,
      } = paymentData;

      const paymentRequest = {
        amount: parseFloat(amount),
        currency: currency || 'NGN',
        country: country || 'NG',
        description,
        order_id: customerId,
        customer: {
          email,
          name: `${firstName || ''} ${lastName || ''}`.trim(),
          document: customerId, // Could be phone number or ID
        },
        notification_url: webhookUrl,
        redirect_url: redirectUrl,
      };

      const response = await this.client.post('/payments', paymentRequest);

      return {
        reference: response.data.id,
        redirectUrl: response.data.redirect_url,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
      };
    } catch (error) {
      throw new Error(`dLocal initialization failed: ${error.message}`);
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
        amount: response.data.amount,
        currency: response.data.currency,
        reference: response.data.id,
        orderId: response.data.order_id,
        createdAt: response.data.created_date,
      };
    } catch (error) {
      throw new Error(`dLocal verification failed: ${error.message}`);
    }
  }

  /**
   * Create payout
   * @param {Object} payoutData - Payout details
   * @returns {Promise<Object>} - Payout reference and status
   */
  async createPayout(payoutData) {
    try {
      const {
        amount,
        currency,
        country,
        bankCode,
        accountNumber,
        accountHolderName,
        description,
      } = payoutData;

      const payoutRequest = {
        amount: parseFloat(amount),
        currency: currency || 'NGN',
        country: country || 'NG',
        payout_method_id: `bank_transfer_${country}`,
        payout_method_details: {
          bank_code: bankCode,
          account_number: accountNumber,
          account_holder_name: accountHolderName,
        },
        description,
        reference_id: `payout-${Date.now()}`,
      };

      const response = await this.client.post('/payouts', payoutRequest);

      return {
        reference: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
      };
    } catch (error) {
      throw new Error(`dLocal payout failed: ${error.message}`);
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

      const response = await this.client.get('/exchange-rates', {
        params: {
          from_currency: fromCurrency,
          to_currency: toCurrency,
        },
      });

      return response.data.rate || 1.0;
    } catch (error) {
      throw new Error(`dLocal FX rate failed: ${error.message}`);
    }
  }

  /**
   * Process refund
   * @param {String} paymentId - Original payment ID
   * @param {Number} amount - Refund amount
   * @returns {Promise<Object>} - Refund status
   */
  async refund(paymentId, amount) {
    try {
      const refundRequest = {
        amount: parseFloat(amount),
        reason: 'customer_request',
      };

      const response = await this.client.post(
        `/payments/${paymentId}/refunds`,
        refundRequest
      );

      return {
        reference: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
      };
    } catch (error) {
      throw new Error(`dLocal refund failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * Uses MD5 hash of payload + secret
   * @param {String} payload - Webhook payload (JSON stringified)
   * @param {String} signature - Webhook signature header (X-Signature)
   * @returns {Boolean} - Signature validity
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const hash = crypto
        .createHash('md5')
        .update(payload + this.secret)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      return false;
    }
  }
}

module.exports = DLocalProvider;
