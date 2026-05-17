const axios = require('axios');
const crypto = require('crypto');

/**
 * Wise (TransferWise) Payment Provider
 * Handles international transfers and multi-currency payments
 */
class WiseProvider {
  constructor(apiKey, secret) {
    this.apiKey = apiKey;
    this.secret = secret;
    this.baseURL = 'https://api.wise.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initialize payment via Wise (create quote)
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} - Quote reference and details
   */
  async initializePayment(paymentData) {
    try {
      const {
        sourceAmount,
        sourceCurrency,
        targetCurrency,
        profileId,
        targetAccountId,
        reference,
      } = paymentData;

      // Create a quote first
      const quoteRequest = {
        sourceCurrency,
        targetCurrency,
        sourceAmount: parseFloat(sourceAmount),
        profile: parseInt(profileId),
      };

      const quoteResponse = await this.client.post('/quotes', quoteRequest);

      // Create transfer intent
      const transferRequest = {
        targetAccount: parseInt(targetAccountId),
        quoteUuid: quoteResponse.data.id,
        details: {
          reference: reference || `transfer-${Date.now()}`,
          transferPurpose: 'other',
          transferPurposeSubTransferPurpose: 'other',
        },
      };

      const transferResponse = await this.client.post('/transfers', transferRequest);

      return {
        reference: transferResponse.data.id,
        quoteId: quoteResponse.data.id,
        status: transferResponse.data.status,
        amount: transferResponse.data.sourceValue,
        currency: transferResponse.data.sourceCurrency,
        targetAmount: transferResponse.data.targetValue,
        targetCurrency: transferResponse.data.targetCurrency,
        rate: quoteResponse.data.rate,
      };
    } catch (error) {
      throw new Error(`Wise initialization failed: ${error.message}`);
    }
  }

  /**
   * Verify transfer status
   * @param {String} reference - Transfer reference
   * @returns {Promise<Object>} - Transfer status and details
   */
  async verifyPayment(reference) {
    try {
      const response = await this.client.get(`/transfers/${reference}`);

      return {
        status: response.data.status,
        reference: response.data.id,
        amount: response.data.sourceValue,
        currency: response.data.sourceCurrency,
        targetAmount: response.data.targetValue,
        targetCurrency: response.data.targetCurrency,
        recipient: response.data.recipient,
        createdAt: response.data.created,
      };
    } catch (error) {
      throw new Error(`Wise verification failed: ${error.message}`);
    }
  }

  /**
   * Create payout via Wise (initiate transfer fund)
   * @param {Object} payoutData - Payout details
   * @returns {Promise<Object>} - Payout reference and status
   */
  async createPayout(payoutData) {
    try {
      const {
        sourceAmount,
        sourceCurrency,
        targetCurrency,
        targetAccount,
        profileId,
        reference,
      } = payoutData;

      // Create quote
      const quoteRequest = {
        sourceCurrency,
        targetCurrency,
        sourceAmount: parseFloat(sourceAmount),
        profile: parseInt(profileId),
      };

      const quoteResponse = await this.client.post('/quotes', quoteRequest);

      // Create transfer
      const transferRequest = {
        targetAccount: parseInt(targetAccount),
        quoteUuid: quoteResponse.data.id,
        details: {
          reference: reference || `payout-${Date.now()}`,
          transferPurpose: 'other',
        },
      };

      const transferResponse = await this.client.post('/transfers', transferRequest);

      // Fund the transfer
      const fundRequest = {
        type: 'BALANCE',
      };

      await this.client.post(`/transfers/${transferResponse.data.id}/fund`, fundRequest);

      return {
        reference: transferResponse.data.id,
        status: 'funded',
        amount: transferResponse.data.sourceValue,
        currency: transferResponse.data.sourceCurrency,
        targetAmount: transferResponse.data.targetValue,
        targetCurrency: transferResponse.data.targetCurrency,
      };
    } catch (error) {
      throw new Error(`Wise payout failed: ${error.message}`);
    }
  }

  /**
   * Get FX rates (real-time)
   * @param {String} fromCurrency - Source currency
   * @param {String} toCurrency - Target currency
   * @returns {Promise<Number>} - Exchange rate
   */
  async getFXRate(fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) return 1.0;

      const response = await this.client.get('/rates', {
        params: {
          source: fromCurrency,
          target: toCurrency,
        },
      });

      return response.data[0] || 1.0;
    } catch (error) {
      throw new Error(`Wise FX rate failed: ${error.message}`);
    }
  }

  /**
   * Cancel transfer (refund equivalent)
   * @param {String} transferId - Transfer ID
   * @param {Number} amount - Amount (unused, cancels whole transfer)
   * @returns {Promise<Object>} - Cancellation status
   */
  async refund(transferId, amount) {
    try {
      const response = await this.client.put(`/transfers/${transferId}/cancel`);

      return {
        reference: response.data.id,
        status: response.data.status,
        amount: response.data.sourceValue,
        currency: response.data.sourceCurrency,
      };
    } catch (error) {
      throw new Error(`Wise refund failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * @param {String} payload - Webhook payload (stringified)
   * @param {String} signature - Webhook signature from header
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

module.exports = WiseProvider;
