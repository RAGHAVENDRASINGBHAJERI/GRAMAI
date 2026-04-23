const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { authenticate: protect } = require('../middleware/authMiddleware');
const communityController = require('../controllers/communityController');
const env = require('../config/env');

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const match = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (match.indexOf(file.mimetype) === -1) {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  }
});

// Community Routes
router.get('/posts', protect, communityController.getPosts); // Requires login to view feed
router.get('/images/:id', communityController.getImage);

// Create Post
router.post('/posts', protect, upload.single('image'), communityController.createPost);

// Update Status
router.patch('/posts/:id/status', protect, communityController.updatePostStatus);

module.exports = router;
