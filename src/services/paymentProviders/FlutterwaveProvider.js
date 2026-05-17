const axios = require('axios');
const crypto = require('crypto');
const BasePaymentProvider = require('./BaseProvider');
const logger = require('../../config/logger');

class FlutterwaveProvider extends BasePaymentProvider {
  constructor(apiKey, secret) {
    super(apiKey, secret);
    this.baseUrl = 'https://api.flutterwave.com/v3';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  }

  async initializePayment(paymentData) {
    try {
      const {
        amount,
        currency,
        email,
        phone_number,
        order_number,
        redirect_url,
      } = paymentData;

      const response = await this.client.post('/payments', {
        tx_ref: order_number,
        amount,
        currency,
        payment_options: 'card,banktransfer,mobilemoneyghana,mobilemoneyzambia',
        redirect_url,
        customer: {
          email,
          phone_number,
        },
        customizations: {
          title: 'DeskMain Payment',
          description: `Payment for order ${order_number}`,
          logo: 'https://deskmain.com/logo.png',
        },
      });

      logger.info(`Flutterwave payment initialized: ${order_number}`);

      return {
        reference: response.data.data.link,
        redirect_url: response.data.data.link,
        provider_reference: order_number,
      };
    } catch (error) {
      logger.error('Flutterwave payment initialization error:', error);
      throw error;
    }
  }

  async verifyPayment(reference) {
    try {
      const response = await this.client.get(`/transactions/verify_by_reference?tx_ref=${reference}`);

      const data = response.data.data;
      const isSuccessful = data.status === 'successful';

      logger.info(`Flutterwave payment verified: ${reference} - ${isSuccessful ? 'success' : 'failed'}`);

      return {
        status: isSuccessful ? 'success' : 'failed',
        amount: data.amount,
        currency: data.currency,
        payment_method: data.payment_type,
        provider_reference: data.id,
      };
    } catch (error) {
      logger.error('Flutterwave payment verification error:', error);
      throw error;
    }
  }

  async createPayout(payoutData) {
    try {
      const {
        account_number,
        bank_code,
        amount,
        currency,
        narration,
      } = payoutData;

      const response = await this.client.post('/transfers', {
        account_number,
        bank_code,
        amount,
        currency: currency || 'NGN',
        narration,
        reference: `PAYOUT-${Date.now()}`,
      });

      logger.info(`Flutterwave payout created: ${response.data.data.id}`);

      return {
        status: 'processing',
        provider_reference: response.data.data.id,
        amount,
        currency,
      };
    } catch (error) {
      logger.error('Flutterwave payout error:', error);
      throw error;
    }
  }

  async getFXRate(fromCurrency, toCurrency) {
    try {
      const response = await this.client.get(`/transfers/rates?from=${fromCurrency}&to=${toCurrency}`);
      return response.data.data.rate;
    } catch (error) {
      logger.error('Flutterwave FX rate fetch error:', error);
      throw error;
    }
  }

  async refund(transactionId, amount) {
    try {
      const response = await this.client.post(`/transactions/${transactionId}/refund`, { amount });

      logger.info(`Flutterwave refund processed: ${transactionId}`);

      return {
        status: 'success',
        refund_reference: response.data.data.id,
      };
    } catch (error) {
      logger.error('Flutterwave refund error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload, signature) {
    const hash = crypto.createHmac('sha256', this.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return hash === signature;
  }
}

module.exports = FlutterwaveProvider;
