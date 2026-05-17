const FlutterwaveProvider = require('./FlutterwaveProvider');
const StripeProvider = require('./StripeProvider');
const PayoneerProvider = require('./PayoneerProvider');
const WiseProvider = require('./WiseProvider');
const AirwallexProvider = require('./AirwallexProvider');
const DLocalProvider = require('./DLocalProvider');

/**
 * Payment Provider Factory
 * Creates and returns appropriate payment provider instance
 */
class PaymentProviderFactory {
  static providers = {
    flutterwave: FlutterwaveProvider,
    stripe: StripeProvider,
    payoneer: PayoneerProvider,
    wise: WiseProvider,
    airwallex: AirwallexProvider,
    dlocal: DLocalProvider,
  };

  /**
   * Get payment provider instance
   * @param {String} providerName - Provider name (flutterwave, stripe, etc)
   * @param {String} apiKey - Provider API key
   * @param {String} secret - Provider secret/password
   * @returns {Object} - Payment provider instance
   */
  static getProvider(providerName, apiKey, secret) {
    const providerClass = this.providers[providerName.toLowerCase()];

    if (!providerClass) {
      throw new Error(
        `Unknown payment provider: ${providerName}. Available: ${Object.keys(this.providers).join(', ')}`
      );
    }

    return new providerClass(apiKey, secret);
  }

  /**
   * Get list of supported providers
   * @returns {Array<String>} - Array of supported provider names
   */
  static getSupportedProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Register custom provider
   * @param {String} name - Provider name
   * @param {Class} providerClass - Provider class extending BaseProvider
   */
  static registerProvider(name, providerClass) {
    this.providers[name.toLowerCase()] = providerClass;
  }
}

module.exports = PaymentProviderFactory;
