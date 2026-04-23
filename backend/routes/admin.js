const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const { validateBody, schemas } = require('../middleware/validate');

// All admin routes require authentication + admin role
router.use(authenticate, isAdmin);

// Dashboard
router.get('/stats', adminController.getStats);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Queries
router.get('/queries', adminController.getQueries);

// Schemes CRUD
router.get('/schemes', adminController.getSchemes);
router.post('/schemes', validateBody(schemas.scheme), adminController.createScheme);
router.put('/schemes/:id', validateBody(schemas.scheme), adminController.updateScheme);
router.delete('/schemes/:id', adminController.deleteScheme);

// Posts (Marketplace)
router.get('/posts', adminController.getAdminPosts);
router.patch('/posts/:id/status', adminController.updateAdminPostStatus);
router.delete('/posts/:id', adminController.deleteAdminPost);

module.exports = router;
