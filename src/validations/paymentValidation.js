const Joi = require('joi');

/**
 * Payment and payout validation schemas
 */
const paymentValidation = {
  /**
   * Initialize payment
   */
  initializePayment: Joi.object({
    amount: Joi.number()
      .positive()
      .required()
      .messages({
        'any.required': 'Amount is required',
        'number.positive': 'Amount must be greater than 0',
      }),
    currency: Joi.string()
      .length(3)
      .required()
      .messages({
        'any.required': 'Currency is required',
        'string.length': 'Currency must be 3 characters',
      }),
    provider: Joi.string()
      .valid('flutterwave', 'stripe', 'payoneer', 'wise', 'airwallex', 'dlocal')
      .required()
      .messages({
        'any.required': 'Payment provider is required',
        'any.only': 'Invalid payment provider',
      }),
    description: Joi.string()
      .max(500)
      .required(),
    redirectUrl: Joi.string()
      .uri()
      .required(),
    webhookUrl: Joi.string()
      .uri()
      .optional(),
  }),

  /**
   * Verify payment
   */
  verifyPayment: Joi.object({
    reference: Joi.string()
      .required()
      .messages({
        'any.required': 'Payment reference is required',
      }),
    provider: Joi.string()
      .valid('flutterwave', 'stripe', 'payoneer', 'wise', 'airwallex', 'dlocal')
      .required()
      .messages({
        'any.required': 'Payment provider is required',
      }),
  }),

  /**
   * Process payout
   */
  createPayout: Joi.object({
    amount: Joi.number()
      .positive()
      .required()
      .messages({
        'any.required': 'Amount is required',
        'number.positive': 'Amount must be greater than 0',
      }),
    currency: Joi.string()
      .length(3)
      .required()
      .messages({
        'any.required': 'Currency is required',
        'string.length': 'Currency must be 3 characters',
      }),
    method: Joi.string()
      .valid('bank_transfer', 'wallet', 'mobile_money', 'check')
      .required()
      .messages({
        'any.required': 'Payout method is required',
        'any.only': 'Invalid payout method',
      }),
    bank_account_id: Joi.number()
      .integer()
      .optional(),
    description: Joi.string()
      .max(500)
      .optional(),
  }),

  /**
   * Add bank account
   */
  addBankAccount: Joi.object({
    bank_name: Joi.string()
      .max(255)
      .required()
      .messages({
        'any.required': 'Bank name is required',
      }),
    account_number: Joi.string()
      .max(50)
      .required()
      .messages({
        'any.required': 'Account number is required',
      }),
    account_holder_name: Joi.string()
      .max(255)
      .required()
      .messages({
        'any.required': 'Account holder name is required',
      }),
    bank_code: Joi.string()
      .max(50)
      .optional(),
    ifsc_code: Joi.string()
      .max(50)
      .optional(),
    country: Joi.string()
      .length(2)
      .required()
      .messages({
        'any.required': 'Country is required',
      }),
    currency: Joi.string()
      .length(3)
      .required()
      .messages({
        'any.required': 'Currency is required',
      }),
  }),

  /**
   * Process refund
   */
  refund: Joi.object({
    amount: Joi.number()
      .positive()
      .required()
      .messages({
        'any.required': 'Amount is required',
        'number.positive': 'Amount must be greater than 0',
      }),
    reason: Joi.string()
      .valid('customer_request', 'duplicate_charge', 'fraudulent', 'other')
      .required()
      .messages({
        'any.required': 'Reason is required',
        'any.only': 'Invalid reason',
      }),
    notes: Joi.string()
      .max(500)
      .optional(),
  }),

  /**
   * Wallet deposit
   */
  deposit: Joi.object({
    amount: Joi.number()
      .positive()
      .required()
      .messages({
        'any.required': 'Amount is required',
        'number.positive': 'Amount must be greater than 0',
      }),
    currency: Joi.string()
      .length(3)
      .required()
      .messages({
        'any.required': 'Currency is required',
      }),
    reference: Joi.string()
      .max(255)
      .optional(),
  }),
};

module.exports = paymentValidation;
