const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.nexora_token) {
    token = req.cookies.nexora_token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route. Please log in.', 401));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const currentUser = await User.findById(decoded.userId).select('-passwordHash');

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed or expired.', 401));
  }
});

module.exports = { protect };