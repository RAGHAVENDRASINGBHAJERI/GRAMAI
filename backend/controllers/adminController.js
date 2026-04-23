const User = require('../models/User');
const Query = require('../models/Query');
const Scheme = require('../models/Scheme');
const Post = require('../models/Post');
const { success, created, badRequest, notFound } = require('../utils/responseHelper');

/**
 * Get admin dashboard stats
 */
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalQueries,
      queriesToday,
      totalSchemes,
      languageStats,
      categoryStats,
    ] = await Promise.all([
      User.countDocuments(),
      Query.countDocuments(),
      Query.countDocuments({
        timestamp: { $gte: new Date().setHours(0, 0, 0, 0) },
      }),
      Scheme.countDocuments(),
      Query.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } },
      ]),
      Query.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    // Get top language
    const topLanguage = languageStats.sort((a, b) => b.count - a.count)[0]?._id || 'en';

    return success(res, {
      totalUsers,
      totalQueries,
      queriesToday,
      totalSchemes,
      topLanguage,
      languageStats,
      categoryStats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all users (paginated)
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -__v');

    return success(res, { users }, 'Users retrieved', 200, {
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
 * Update user role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return badRequest(res, 'Invalid role specified');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return notFound(res, 'User not found');
    }

    return success(res, { user }, 'User role updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a user
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return notFound(res, 'User not found');
    }
    // Optionally delete associated posts and queries here
    await Post.deleteMany({ userId: req.params.id });
    
    return success(res, null, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Get all queries (paginated)
 */
const getQueries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, userId } = req.query;
    const query = {};

    if (category) query.category = category;
    if (userId) query.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Query.countDocuments(query);

    const queries = await Query.find(query)
      .populate('userId', 'name email phone')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    return success(res, { queries }, 'Queries retrieved', 200, {
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
 * Create a new scheme
 */
const createScheme = async (req, res, next) => {
  try {
    const schemeData = req.body;
    const scheme = await Scheme.create(schemeData);
    return created(res, { scheme }, 'Scheme created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Update a scheme
 */
const updateScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!scheme) {
      return notFound(res, 'Scheme not found');
    }

    return success(res, { scheme }, 'Scheme updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a scheme
 */
const deleteScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) {
      return notFound(res, 'Scheme not found');
    }
    return success(res, null, 'Scheme deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Get all schemes
 */
const getSchemes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, state, ministry, tag, search } = req.query;
    const query = {};

    if (state) query.state = state;
    if (ministry) query.ministry = { $regex: ministry, $options: 'i' };
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameKn: { $regex: search, $options: 'i' } },
        { nameHi: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Scheme.countDocuments(query);

    const schemes = await Scheme.find(query)
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return success(res, { schemes }, 'Schemes retrieved', 200, {
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
 * Get all posts for admin (no status filter)
 */
const getAdminPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { cropType: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return success(res, { posts }, 'Admin posts retrieved', 200, {
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
 * Update post status (Admin)
 */
const updateAdminPostStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'ACTIVE', 'SOLD', 'CLOSED'
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!post) {
      return notFound(res, 'Post not found');
    }

    return success(res, { post }, `Post marked as ${status}`);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a post (Admin)
 */
const deleteAdminPost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return notFound(res, 'Post not found');
    }
    // Note: GridFS image orphans could be cleaned up here via gfsBucket
    return success(res, null, 'Post deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getQueries,
  createScheme,
  updateScheme,
  deleteScheme,
  getSchemes,
  getAdminPosts,
  updateAdminPostStatus,
  deleteAdminPost,
};
