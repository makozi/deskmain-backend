const Joi = require('joi');

/**
 * Order validation schemas
 */
const orderValidation = {
  /**
   * Create order
   */
  create: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.number()
            .integer()
            .required()
            .messages({
              'any.required': 'Product ID is required',
            }),
          quantity: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
              'any.required': 'Quantity is required',
              'number.min': 'Quantity must be at least 1',
            }),
          price: Joi.number()
            .positive()
            .required()
            .messages({
              'any.required': 'Price is required',
            }),
          variant_id: Joi.number()
            .integer()
            .optional(),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Order must contain at least one item',
        'any.required': 'Items are required',
      }),
    currency: Joi.string()
      .length(3)
      .required()
      .messages({
        'any.required': 'Currency is required',
        'string.length': 'Currency must be 3 characters',
      }),
    coupon_code: Joi.string()
      .max(50)
      .optional(),
    shipping_address: Joi.object({
      first_name: Joi.string()
        .max(100)
        .required(),
      last_name: Joi.string()
        .max(100)
        .required(),
      address: Joi.string()
        .max(500)
        .required(),
      city: Joi.string()
        .max(100)
        .required(),
      state: Joi.string()
        .max(100)
        .required(),
      postal_code: Joi.string()
        .max(20)
        .required(),
      country: Joi.string()
        .length(2)
        .required(),
      phone: Joi.string()
        .max(20)
        .optional(),
    }).optional(),
  }),

  /**
   * Update order status
   */
  updateStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
      .required()
      .messages({
        'any.required': 'Status is required',
        'any.only': 'Invalid status',
      }),
    tracking_number: Joi.string()
      .max(100)
      .optional(),
    notes: Joi.string()
      .max(500)
      .optional(),
  }),

  /**
   * Process refund
   */
  refund: Joi.object({
    reason: Joi.string()
      .valid('customer_request', 'defective', 'not_as_described', 'other')
      .required()
      .messages({
        'any.required': 'Reason is required',
        'any.only': 'Invalid reason',
      }),
    amount: Joi.number()
      .positive()
      .optional()
      .messages({
        'number.positive': 'Amount must be greater than 0',
      }),
    notes: Joi.string()
      .max(500)
      .optional(),
  }),

  /**
   * Apply coupon
   */
  applyCoupon: Joi.object({
    code: Joi.string()
      .max(50)
      .required()
      .messages({
        'any.required': 'Coupon code is required',
      }),
  }),
};

module.exports = orderValidation;
