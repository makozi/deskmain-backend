const Joi = require('joi');

/**
 * Merchant validation schemas
 */
const merchantValidation = {
  /**
   * Create merchant account
   */
  create: Joi.object({
    business_name: Joi.string()
      .max(255)
      .required()
      .messages({
        'any.required': 'Business name is required',
        'string.max': 'Business name cannot exceed 255 characters',
      }),
    country: Joi.string()
      .length(2)
      .required()
      .messages({
        'any.required': 'Country code is required',
        'string.length': 'Country code must be 2 characters',
      }),
    currency: Joi.string()
      .length(3)
      .optional()
      .messages({
        'string.length': 'Currency code must be 3 characters',
      }),
  }),

  /**
   * Update merchant profile
   */
  update: Joi.object({
    business_name: Joi.string()
      .max(255)
      .optional(),
    description: Joi.string()
      .max(1000)
      .optional(),
    address: Joi.string()
      .max(500)
      .optional(),
    city: Joi.string()
      .max(100)
      .optional(),
    state: Joi.string()
      .max(100)
      .optional(),
    country: Joi.string()
      .length(2)
      .optional(),
    postal_code: Joi.string()
      .max(20)
      .optional(),
    tax_id: Joi.string()
      .max(50)
      .optional(),
  }).min(1),

  /**
   * Submit KYC documents
   */
  submitKYC: Joi.object({
    kyc_tier: Joi.number()
      .integer()
      .min(0)
      .max(3)
      .required()
      .messages({
        'any.required': 'KYC tier is required',
      }),
    documents: Joi.array()
      .items(
        Joi.object({
          type: Joi.string()
            .valid('national_id', 'passport', 'drivers_license', 'proof_of_address', 'bank_statement')
            .required(),
          file_path: Joi.string()
            .required(),
          file_name: Joi.string()
            .required(),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one document is required',
        'any.required': 'Documents are required',
      }),
  }),

  /**
   * Invite team member
   */
  inviteTeam: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    role: Joi.string()
      .valid('admin', 'manager', 'support', 'analyst')
      .required()
      .messages({
        'any.required': 'Role is required',
        'any.only': 'Invalid role',
      }),
  }),
};

module.exports = merchantValidation;
