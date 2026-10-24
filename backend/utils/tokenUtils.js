const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

const sendTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.cookie('nexora_token', token, cookieOptions);
};

module.exports = {
  generateToken,
  sendTokenCookie
};