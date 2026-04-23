const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { apiLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/authMiddleware');

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
    // We don't verify here as it's optional, just continuing
  } catch (error) {
    // Silently continue
  }
  next();
};

router.get('/generate', apiLimiter, optionalAuth, contentController.generateContent);

module.exports = router;
