const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { protect } = require('../middleware/auth');
const communityController = require('../controllers/communityController');
const env = require('../config/env');

const router = express.Router();

// Setup Multer-GridFS Storage
const storage = new GridFsStorage({
  url: env.mongoUri,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (match.indexOf(file.mimetype) === -1) {
      // Reject non-images
      return null;
    }
    return {
      bucketName: 'postImages', // matches bucket in controller
      filename: `${Date.now()}-community-${file.originalname}`
    };
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Community Routes
router.get('/posts', protect, communityController.getPosts); // Requires login to view feed
router.get('/images/:id', protect, communityController.getImage);

// Create Post
router.post('/posts', protect, upload.single('image'), communityController.createPost);

// Update Status
router.patch('/posts/:id/status', protect, communityController.updatePostStatus);

module.exports = router;
