const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateBody, schemas } = require('../middleware/validate');

// Public routes (with rate limiting)
router.post('/register', authLimiter, validateBody(schemas.register), authController.register);
router.post('/login', authLimiter, validateBody(schemas.login), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, validateBody(schemas.forgotPassword), authController.forgotPassword);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, validateBody(schemas.updateProfile), authController.updateProfile);

module.exports = router;
