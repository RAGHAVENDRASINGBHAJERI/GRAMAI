const mongoose = require('mongoose');
const Post = require('../models/Post');
const { success, badRequest, notFound } = require('../utils/responseHelper');
const env = require('../config/env');

// Init GridFS bucket
let gfsBucket;
mongoose.connection.once('open', () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'postImages'
  });
});

/**
 * Get all posts
 */
exports.getPosts = async (req, res, next) => {
  try {
    const { transactionType, cropType, page = 1, limit = 20 } = req.query;
    const query = { status: 'ACTIVE' };
    
    if (transactionType) query.transactionType = transactionType;
    if (cropType) query.cropType = new RegExp(cropType, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
      .populate('userId', 'name phone location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return success(res, { posts }, 'Posts retrieved successfully', 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new post
 */
exports.createPost = async (req, res, next) => {
  try {
    const { transactionType, cropType, description, price, quantity, location } = req.body;
    
    let imageId = null;
    if (req.file) {
      imageId = req.file.id;
    }

    const post = await Post.create({
      userId: req.user.id,
      transactionType,
      cropType,
      description,
      price: Number(price),
      quantity,
      location,
      imageId
    });

    return success(res, { post }, 'Post created successfully', 201);
  } catch (err) {
    // If post fails, optionally delete the orphaned GridFS image here
    next(err);
  }
};

/**
 * Stream image from GridFS
 */
exports.getImage = async (req, res, next) => {
  try {
    const imageId = new mongoose.Types.ObjectId(req.params.id);
    
    // Check if file exists
    const files = await gfsBucket.find({ _id: imageId }).toArray();
    
    if (!files || files.length === 0) {
      return notFound(res, 'Image not found');
    }

    const file = files[0];
    
    // Set appropriate headers
    if (file.contentType) {
      res.set('Content-Type', file.contentType);
    }
    res.set('Cache-Control', 'public, max-age=31536000');
    
    // Stream data
    const readStream = gfsBucket.openDownloadStream(imageId);
    readStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a post as SOLD or CLOSED
 */
exports.updatePostStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'SOLD', 'CLOSED'
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );

    if (!post) {
      return notFound(res, 'Post not found or unauthorized');
    }

    return success(res, { post }, `Post marked as ${status}`);
  } catch (err) {
    next(err);
  }
};
