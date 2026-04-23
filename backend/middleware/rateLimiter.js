const rateLimit = require('express-rate-limit');
const { tooManyRequests } = require('../utils/responseHelper');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return tooManyRequests(res);
  },
});

/**
 * Strict rate limiter for auth routes (prevent brute force)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (req, res) => {
    return tooManyRequests(res, 'Too many login attempts. Please try again after 15 minutes.');
  },
});

/**
 * Chat endpoint rate limiter
 */
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return tooManyRequests(res, 'Too many chat requests. Please slow down.');
  },
});

module.exports = { apiLimiter, authLimiter, chatLimiter };
