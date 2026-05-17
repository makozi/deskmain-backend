const Joi = require('joi');

/**
 * Product validation schemas
 */
const productValidation = {
  /**
   * Create product
   */
  create: Joi.object({
    name: Joi.string()
      .max(255)
      .required()
      .messages({
        'any.required': 'Product name is required',
        'string.max': 'Product name cannot exceed 255 characters',
      }),
    slug: Joi.string()
      .max(255)
      .pattern(/^[a-z0-9-]+$/)
      .required()
      .messages({
        'any.required': 'Product slug is required',
        'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
      }),
    description: Joi.string()
      .max(2000)
      .required()
      .messages({
        'any.required': 'Description is required',
      }),
    type: Joi.string()
      .valid('digital', 'physical', 'service', 'course', 'ebook', 'subscription', 'license', 'event', 'bundle', 'donation')
      .required()
      .messages({
        'any.required': 'Product type is required',
        'any.only': 'Invalid product type',
      }),
    price: Joi.number()
      .positive()
      .required()
      .messages({
        'any.required': 'Price is required',
        'number.positive': 'Price must be greater than 0',
      }),
    currency: Joi.string()
      .length(3)
      .required()
      .messages({
        'any.required': 'Currency is required',
        'string.length': 'Currency must be 3 characters',
      }),
    category: Joi.string()
      .max(100)
      .optional(),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .optional(),
    image_url: Joi.string()
      .uri()
      .optional(),
    is_active: Joi.boolean()
      .optional()
      .default(true),
    variants: Joi.array()
      .items(
        Joi.object({
          name: Joi.string()
            .max(255)
            .required(),
          sku: Joi.string()
            .max(100)
            .required(),
          price: Joi.number()
            .positive()
            .required(),
          stock: Joi.number()
            .integer()
            .min(0)
            .optional(),
        })
      )
      .optional(),
  }),

  /**
   * Update product
   */
  update: Joi.object({
    name: Joi.string()
      .max(255)
      .optional(),
    description: Joi.string()
      .max(2000)
      .optional(),
    price: Joi.number()
      .positive()
      .optional(),
    category: Joi.string()
      .max(100)
      .optional(),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .optional(),
    image_url: Joi.string()
      .uri()
      .optional(),
    is_active: Joi.boolean()
      .optional(),
  }).min(1),

  /**
   * Create product variant
   */
  createVariant: Joi.object({
    name: Joi.string()
      .max(255)
      .required(),
    sku: Joi.string()
      .max(100)
      .required(),
    price: Joi.number()
      .positive()
      .required(),
    stock: Joi.number()
      .integer()
      .min(0)
      .required(),
  }),

  /**
   * Add product files (for digital products)
   */
  addFile: Joi.object({
    file_name: Joi.string()
      .max(255)
      .required(),
    file_url: Joi.string()
      .uri()
      .required(),
    file_type: Joi.string()
      .max(50)
      .required(),
    file_size: Joi.number()
      .integer()
      .positive()
      .optional(),
  }),
};

module.exports = productValidation;
