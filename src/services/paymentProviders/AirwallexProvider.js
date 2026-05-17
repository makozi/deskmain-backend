const axios = require('axios');
const crypto = require('crypto');

/**
 * Airwallex Payment Provider
 * Handles global payments and payouts with multi-currency support
 */
class AirwallexProvider {
  constructor(apiKey, secret) {
    this.apiKey = apiKey;
    this.secret = secret;
    this.baseURL = 'https://api.airwallex.com/api/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get authorization token
   * @returns {Promise<String>} - Bearer token
   */
  async getAuthToken() {
    try {
      const response = await axios.post(
        'https://api.airwallex.com/api/v1/authentication_credential',
        {
          api_key: this.apiKey,
          api_secret: this.secret,
        }
      );

      return response.data.token;
    } catch (error) {
      throw new Error(`Airwallex auth failed: ${error.message}`);
    }
  }

  /**
   * Initialize payment
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
        redirectUrl,
        webhookUrl,
      } = paymentData;

      const token = await this.getAuthToken();
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const paymentRequest = {
        request_id: `payment-${Date.now()}`,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        merchant_order_id: customerId,
        order: {
          products: [
            {
              code: 'payment',
              name: description,
              quantity: 1,
              unit_price: parseFloat(amount),
            },
          ],
        },
        customer_id: customerId,
        customer: {
          email,
          first_name: email.split('@')[0],
        },
        settings: {
          redirect_url: redirectUrl,
          webhook_url: webhookUrl,
        },
      };

      const response = await this.client.post('/payments', paymentRequest);

      return {
        reference: response.data.id,
        redirectUrl: response.data.next_action?.redirect_url,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
      };
    } catch (error) {
      throw new Error(`Airwallex initialization failed: ${error.message}`);
    }
  }

  /**
   * Verify payment status
   * @param {String} reference - Payment reference
   * @returns {Promise<Object>} - Payment status and details
   */
  async verifyPayment(reference) {
    try {
      const token = await this.getAuthToken();
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await this.client.get(`/payments/${reference}`);

      return {
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
        reference: response.data.id,
        customerId: response.data.merchant_order_id,
        createdAt: response.data.created_at,
      };
    } catch (error) {
      throw new Error(`Airwallex verification failed: ${error.message}`);
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
        recipientId,
        description,
      } = payoutData;

      const token = await this.getAuthToken();
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const payoutRequest = {
        request_id: `payout-${Date.now()}`,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        recipient_id: recipientId,
        description,
      };

      const response = await this.client.post('/payouts', payoutRequest);

      return {
        reference: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
      };
    } catch (error) {
      throw new Error(`Airwallex payout failed: ${error.message}`);
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

      const token = await this.getAuthToken();
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await this.client.get('/fx_rates', {
        params: {
          source_currency: fromCurrency,
          target_currency: toCurrency,
        },
      });

      return response.data.rate || 1.0;
    } catch (error) {
      throw new Error(`Airwallex FX rate failed: ${error.message}`);
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
      const token = await this.getAuthToken();
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const refundRequest = {
        request_id: `refund-${Date.now()}`,
        amount: parseFloat(amount),
      };

      const response = await this.client.post(`/payments/${paymentId}/refunds`, refundRequest);

      return {
        reference: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
      };
    } catch (error) {
      throw new Error(`Airwallex refund failed: ${error.message}`);
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

module.exports = AirwallexProvider;
