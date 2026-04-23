const { verifyAccessToken } = require('../utils/jwt');
const { unauthorized } = require('../utils/responseHelper');
const User = require('../models/User');

/**
 * Middleware to verify JWT access token
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Check cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return unauthorized(res, 'Access token is required');
    }

    const decoded = verifyAccessToken(token);
    
    // Attach user to request
    const user = await User.findById(decoded.userId);
    if (!user) {
      return unauthorized(res, 'User not found');
    }

    req.user = {
      id: user._id,
      role: user.role,
      languagePreference: user.languagePreference,
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return unauthorized(res, 'Access token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      return unauthorized(res, 'Invalid access token');
    }
    return unauthorized(res, 'Authentication failed');
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = {
          id: user._id,
          role: user.role,
          languagePreference: user.languagePreference,
        };
      }
    }
  } catch (error) {
    // Silently continue without user
  }
  next();
};

module.exports = { authenticate, optionalAuth };
