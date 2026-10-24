const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d'
  });
};

const sendTokenCookie = (res, token) => {
  const isProd = env.NODE_ENV === 'production' || process.env.RENDER === 'true';

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days
    httpOnly: true,
    secure: isProd ? true : false,
    sameSite: isProd ? 'none' : 'lax'
  };

  res.cookie('nexora_token', token, cookieOptions);
  res.cookie('token', token, cookieOptions);
};

module.exports = {
  generateToken,
  sendTokenCookie
};