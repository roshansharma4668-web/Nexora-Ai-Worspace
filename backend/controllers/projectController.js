const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getProjects = asyncHandler(async (req, res, next) => {
  const { workspaceId } = req.params;
  const projects = await Project.find({ workspaceId, isArchived: false })
    .populate('ownerId', 'name email avatarColor')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { projects }
  });
});

const createProject = asyncHandler(async (req, res, next) => {
  const { workspaceId } = req.params;
  const { name, description, status, priority, deadline, members } = req.body;

  const project = await Project.create({
    workspaceId,
    name,
    description: description || '',
    status: status || 'Planning',
    priority: priority || 'Medium',
    deadline,
    ownerId: req.user._id,
    members: members || [req.user._id]
  });

  await ActivityLog.create({
    workspaceId,
    projectId: project._id,
    actorId: req.user._id,
    action: 'PROJECT_CREATED',
    details: `Created project "${name}"`
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully.',
    data: { project }
  });
});

const getProjectById = asyncHandler(async (req, res, next) => {
  const { workspaceId, projectId } = req.params;
  const project = await Project.findOne({ _id: projectId, workspaceId })
    .populate('ownerId', 'name email avatarColor')
    .populate('members', 'name email avatarColor');

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  res.status(200).json({
    success: true,
    data: { project }
  });
});

const updateProject = asyncHandler(async (req, res, next) => {
  const { workspaceId, projectId } = req.params;
  const project = await Project.findOneAndUpdate({ _id: projectId, workspaceId }, req.body, {
    new: true,
    runValidators: true
  });

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  await ActivityLog.create({
    workspaceId,
    projectId: project._id,
    actorId: req.user._id,
    action: 'PROJECT_UPDATED',
    details: `Updated project "${project.name}"`
  });

  res.status(200).json({
    success: true,
    message: 'Project updated successfully.',
    data: { project }
  });
});

const deleteProject = asyncHandler(async (req, res, next) => {
  const { workspaceId, projectId } = req.params;
  const project = await Project.findOneAndUpdate(
    { _id: projectId, workspaceId },
    { isArchived: true },
    { new: true }
  );

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Project archived successfully.'
  });
});

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
};