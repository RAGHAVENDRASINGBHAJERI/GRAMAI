const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');
const { validateBody, schemas } = require('../middleware/validate');

// Chat routes
router.post('/', chatLimiter, optionalAuth, validateBody(schemas.chatQuery), chatController.processQuery);
router.get('/history', authenticate, chatController.getHistory);
router.patch('/:id/save', authenticate, chatController.toggleSave);
router.delete('/:id', authenticate, chatController.deleteQuery);

module.exports = router;
