const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
} = require('../utils/jwt');
const { success, created, unauthorized, badRequest, error } = require('../utils/responseHelper');
const env = require('../config/env');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, languagePreference } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return badRequest(res, 'User with this email or phone already exists');
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      languagePreference,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiryDate(),
    });

    // Set httpOnly cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return created(res, {
      user,
      accessToken,
    }, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email }, { phone }],
    }).select('+password');

    if (!user) {
      return unauthorized(res, 'Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return unauthorized(res, 'Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiryDate(),
    });

    // Set httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return success(res, {
      user,
      accessToken,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

/**
 * Refresh access token
 */
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return unauthorized(res, 'Refresh token is required');
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return unauthorized(res, 'Invalid or expired refresh token');
    }

    // Check if token exists in DB
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.isExpired()) {
      if (storedToken) await storedToken.deleteOne();
      return unauthorized(res, 'Refresh token has been revoked');
    }

    // Generate new access token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return unauthorized(res, 'User not found');
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return success(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return error(res, 'User not found', 404);
    }
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, languagePreference } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (languagePreference) updateFields.languagePreference = languagePreference;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      return error(res, 'User not found', 404);
    }

    return success(res, { user }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Forgot password (placeholder - would send email/SMS in production)
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return success(res, null, 'If the email exists, a reset link has been sent');
    }

    // In production: generate reset token, send email/SMS
    // For demo: just return success
    return success(res, null, 'If the email exists, a reset link has been sent');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
};
