const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    env.jwtSecret,
    { expiresIn: env.accessTokenExpiry }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    env.jwtRefreshSecret,
    { expiresIn: env.refreshTokenExpiry }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwtRefreshSecret);
};

const getRefreshTokenExpiryDate = () => {
  // Parse 7d to milliseconds
  const match = env.refreshTokenExpiry.match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  return new Date(Date.now() + value * (multipliers[unit] || 86400000));
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
};
