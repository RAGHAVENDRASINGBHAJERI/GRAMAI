const User = require('../models/User');
const Query = require('../models/Query');
const Scheme = require('../models/Scheme');
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

module.exports = {
  getStats,
  getUsers,
  getQueries,
  createScheme,
  updateScheme,
  deleteScheme,
  getSchemes,
};
