const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Header se token nikalo (case-insensitive)
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    const extracted = authHeader.split(' ')[1];
    if (extracted && extracted !== 'undefined' && extracted !== 'null') {
      token = extracted;
    }
  }

  // 2. Fallback: Cookie se token nikalo
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route. Please login.', 401));
  }

  try {
    // env.JWT_SECRET aur process.env.JWT_SECRET dono ko support karega
    const secret = (env && env.JWT_SECRET) || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    // tokenUtils.js ne chahe id, _id, ya userId naam rakha ho, sab pakad lega!
    const userId = decoded.id || decoded._id || decoded.userId || decoded.sub;

    req.user = await User.findById(userId).select('-passwordHash');

    if (!req.user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed or expired.', 401));
  }
});

module.exports = { protect };