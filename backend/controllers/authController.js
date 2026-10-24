const User = require('../models/User');
const Workspace = require('../models/Workspace');
const WorkspaceMembership = require('../models/WorkspaceMembership');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken, sendTokenCookie } = require('../utils/tokenUtils');

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email is already registered. Please login instead.', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    passwordHash
  });

  // Automatically create a default personal workspace for the new user
  const workspaceSlug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
  const workspace = await Workspace.create({
    name: `${name}'s Workspace`,
    slug: workspaceSlug,
    description: 'Your personal default workspace.',
    ownerId: user._id
  });

  await WorkspaceMembership.create({
    workspaceId: workspace._id,
    userId: user._id,
    role: 'owner'
  });

  user.lastActiveWorkspaceId = workspace._id;
  await user.save();

  const token = generateToken(user._id);
  sendTokenCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'User registered and default workspace created successfully.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        themePreference: user.themePreference,
        lastActiveWorkspaceId: user.lastActiveWorkspaceId
      },
      workspace: {
        id: workspace._id,
        name: workspace.name,
        slug: workspace.slug
      }
    }
  });
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const token = generateToken(user._id);
  sendTokenCookie(res, token);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        themePreference: user.themePreference,
        lastActiveWorkspaceId: user.lastActiveWorkspaceId
      }
    }
  });
});

const logoutUser = asyncHandler(async (req, res, next) => {
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
  maxAge: 7 * 24 * 60 * 60 * 1000 
});
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

const getCurrentUser = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatarColor: req.user.avatarColor,
        themePreference: req.user.themePreference,
        lastActiveWorkspaceId: req.user.lastActiveWorkspaceId
      }
    }
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
};