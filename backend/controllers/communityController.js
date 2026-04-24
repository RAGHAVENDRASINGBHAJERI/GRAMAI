const mongoose = require('mongoose');
const Post = require('../models/Post');
const CommunityImage = require('../models/CommunityImage');
const { success, badRequest, notFound } = require('../utils/responseHelper');
const env = require('../config/env');

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
      .populate('userId', 'name phone email location')
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
      const imageDoc = await CommunityImage.create({
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname
      });
      imageId = imageDoc._id;
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
    const image = await CommunityImage.findById(imageId);
    
    if (!image) {
      return notFound(res, 'Image not found');
    }

    // Set appropriate headers
    res.set('Content-Type', image.contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    
    // Send data
    res.send(Buffer.from(image.data));
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

/**
 * Delete a post (Admin or Owner)
 */
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return notFound(res, 'Post not found');
    }

    // Allow if owner or admin
    if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return badRequest(res, 'Unauthorized to delete this post', 403);
    }

    // Delete image from DB if it exists
    if (post.imageId) {
      try {
        await CommunityImage.findByIdAndDelete(post.imageId);
      } catch (e) {
        console.error('Error deleting image:', e.message);
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    return success(res, null, 'Post deleted successfully');
  } catch (err) {
    next(err);
  }
};
