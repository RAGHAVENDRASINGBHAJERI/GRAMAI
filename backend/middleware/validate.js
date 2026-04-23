const Joi = require('joi');
const { badRequest } = require('../utils/responseHelper');

/**
 * Middleware factory for validating request body with Joi schema
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return badRequest(res, 'Validation failed', errors);
    }

    req.body = value;
    next();
  };
};

/**
 * Middleware factory for validating request query params
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return badRequest(res, 'Invalid query parameters', errors);
    }

    req.query = value;
    next();
  };
};

/**
 * Middleware factory for validating request params
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return badRequest(res, 'Invalid parameters', errors);
    }

    req.params = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().lowercase().allow(''),
    phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).allow(''),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*\d)/)
      .message('Password must contain at least 1 uppercase letter and 1 number')
      .required(),
    languagePreference: Joi.string().valid('en', 'hi', 'kn').default('en'),
  }).or('email', 'phone'), // At least email or phone required

  login: Joi.object({
    email: Joi.string().email().lowercase(),
    phone: Joi.string(),
    password: Joi.string().required(),
  }).xor('email', 'phone'),

  forgotPassword: Joi.object({
    email: Joi.string().email().lowercase().required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().trim().min(2).max(50),
    phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/),
    languagePreference: Joi.string().valid('en', 'hi', 'kn'),
  }),

  chatQuery: Joi.object({
    question: Joi.string().trim().min(1).max(1000).required(),
    language: Joi.string().valid('en', 'hi', 'kn').default('en'),
    category: Joi.string().valid('agriculture', 'health', 'schemes', 'mandi', 'general').default('general'),
  }),

  scheme: Joi.object({
    name: Joi.string().trim().required(),
    nameKn: Joi.string().trim().allow(''),
    nameHi: Joi.string().trim().allow(''),
    benefits: Joi.array().items(Joi.string()),
    eligibility: Joi.array().items(Joi.string()),
    steps: Joi.array().items(Joi.string()),
    ministry: Joi.string().trim().allow(''),
    state: Joi.string().trim().allow('').default(null),
    tags: Joi.array().items(Joi.string()),
  }),
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  schemas,
};
