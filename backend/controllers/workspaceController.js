const Workspace = require('../models/Workspace');
const WorkspaceMembership = require('../models/WorkspaceMembership');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getMyWorkspaces = asyncHandler(async (req, res, next) => {
  const memberships = await WorkspaceMembership.find({ userId: req.user._id }).populate('workspaceId');
  const workspaces = memberships
    .filter((m) => m.workspaceId !== null)
    .map((m) => ({
      ...m.workspaceId.toObject(),
      role: m.role
    }));

  res.status(200).json({
    success: true,
    data: { workspaces }
  });
});

const createWorkspace = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

  const workspace = await Workspace.create({
    name,
    slug,
    description: description || '',
    ownerId: req.user._id
  });

  await WorkspaceMembership.create({
    workspaceId: workspace._id,
    userId: req.user._id,
    role: 'owner'
  });

  res.status(201).json({
    success: true,
    message: 'Workspace created successfully.',
    data: { workspace }
  });
});

const getWorkspaceById = asyncHandler(async (req, res, next) => {
  const workspace = await Workspace.findById(req.params.workspaceId);
  if (!workspace) {
    return next(new AppError('Workspace not found.', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      workspace,
      membership: req.workspaceMembership
    }
  });
});

const getWorkspaceMembers = asyncHandler(async (req, res, next) => {
  const memberships = await WorkspaceMembership.find({ workspaceId: req.params.workspaceId }).populate(
    'userId',
    'name email avatarColor'
  );

  const members = memberships.map((m) => ({
    id: m.userId._id,
    name: m.userId.name,
    email: m.userId.email,
    avatarColor: m.userId.avatarColor,
    role: m.role
  }));

  res.status(200).json({
    success: true,
    data: { members }
  });
});

module.exports = {
  getMyWorkspaces,
  createWorkspace,
  getWorkspaceById,
  getWorkspaceMembers
};