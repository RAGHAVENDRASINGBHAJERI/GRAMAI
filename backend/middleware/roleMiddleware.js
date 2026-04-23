const { forbidden } = require('../utils/responseHelper');

/**
 * Middleware to restrict access based on user roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Authentication required');
    }
    
    if (!roles.includes(req.user.role)) {
      return forbidden(res, 'You do not have permission to perform this action');
    }
    
    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return forbidden(res, 'Admin access required');
  }
  next();
};

module.exports = { authorize, isAdmin };
