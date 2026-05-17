const stripe = require('stripe');
const BasePaymentProvider = require('./BaseProvider');
const logger = require('../../config/logger');

class StripeProvider extends BasePaymentProvider {
  constructor(apiKey, secret) {
    super(apiKey, secret);
    this.client = stripe(apiKey);
    this.webhookSecret = secret;
  }

  async initializePayment(paymentData) {
    try {
      const {
        amount,
        currency,
        email,
        order_number,
        redirect_url,
      } = paymentData;

      const session = await this.client.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(amount * 100),
            product_data: { name: `Order ${order_number}` },
          },
          quantity: 1,
        }],
        mode: 'payment',
        customer_email: email,
        success_url: redirect_url,
        cancel_url: redirect_url,
        metadata: { order_number },
      });

      logger.info(`Stripe payment session created: ${order_number}`);

      return {
        reference: session.id,
        redirect_url: session.url,
        provider_reference: session.id,
      };
    } catch (error) {
      logger.error('Stripe payment initialization error:', error);
      throw error;
    }
  }

  async verifyPayment(reference) {
    try {
      const session = await this.client.checkout.sessions.retrieve(reference);

      logger.info(`Stripe payment verified: ${reference} - ${session.payment_status}`);

      return {
        status: session.payment_status === 'paid' ? 'success' : 'failed',
        amount: session.amount_total / 100,
        currency: session.currency,
        payment_method: 'card',
        provider_reference: session.payment_intent,
      };
    } catch (error) {
      logger.error('Stripe payment verification error:', error);
      throw error;
    }
  }

  async createPayout(payoutData) {
    try {
      const {
        account_id,
        amount,
        currency,
      } = payoutData;

      const payout = await this.client.payouts.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        destination: account_id,
      });

      logger.info(`Stripe payout created: ${payout.id}`);

      return {
        status: payout.status,
        provider_reference: payout.id,
        amount,
        currency,
      };
    } catch (error) {
      logger.error('Stripe payout error:', error);
      throw error;
    }
  }

  async getFXRate(fromCurrency, toCurrency) {
    // Stripe doesn't provide FX rates directly, use external service or cache
    try {
      // TODO: Implement FX rate caching/fetching
      return 1.0;
    } catch (error) {
      logger.error('Stripe FX rate error:', error);
      throw error;
    }
  }

  async refund(transactionId, amount) {
    try {
      const refund = await this.client.refunds.create({
        payment_intent: transactionId,
        amount: Math.round(amount * 100),
      });

      logger.info(`Stripe refund processed: ${transactionId}`);

      return {
        status: 'success',
        refund_reference: refund.id,
      };
    } catch (error) {
      logger.error('Stripe refund error:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload, signature) {
    try {
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');
      return `t=${Date.now()},v1=${hash}` === signature || hash === signature;
    } catch (error) {
      logger.error('Webhook signature verification error:', error);
      return false;
    }
  }
}

module.exports = StripeProvider;
