const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getTasksByProject = asyncHandler(async (req, res, next) => {
  const { workspaceId, projectId } = req.params;
  const tasks = await Task.find({ workspaceId, projectId })
    .populate('assigneeId', 'name email avatarColor')
    .populate('createdBy', 'name email avatarColor')
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { tasks }
  });
});

const createTask = asyncHandler(async (req, res, next) => {
  const { workspaceId, projectId } = req.params;
  const { title, description, status, priority, assigneeId, dueDate, labels, estimatedHours } = req.body;

  const task = await Task.create({
    workspaceId,
    projectId,
    title,
    description: description || '',
    status: status || 'Todo',
    priority: priority || 'Medium',
    assigneeId: assigneeId || null,
    createdBy: req.user._id,
    dueDate,
    labels: labels || [],
    estimatedHours: estimatedHours || 0
  });

  await ActivityLog.create({
    workspaceId,
    projectId,
    taskId: task._id,
    actorId: req.user._id,
    action: 'TASK_CREATED',
    details: `Created task "${title}"`
  });

  const populatedTask = await Task.findById(task._id).populate('assigneeId', 'name email avatarColor');

  res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: { task: populatedTask }
  });
});

const updateTask = asyncHandler(async (req, res, next) => {
  const { workspaceId, taskId } = req.params;
  const task = await Task.findOneAndUpdate({ _id: taskId, workspaceId }, req.body, {
    new: true,
    runValidators: true
  }).populate('assigneeId', 'name email avatarColor');

  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  await ActivityLog.create({
    workspaceId,
    projectId: task.projectId,
    taskId: task._id,
    actorId: req.user._id,
    action: 'TASK_UPDATED',
    details: `Updated task "${task.title}"`
  });

  res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    data: { task }
  });
});

const moveTaskStatus = asyncHandler(async (req, res, next) => {
  const { workspaceId, taskId } = req.params;
  const { status, order } = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, workspaceId },
    { status, ...(order !== undefined && { order }) },
    { new: true }
  ).populate('assigneeId', 'name email avatarColor');

  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Task status updated.',
    data: { task }
  });
});

const deleteTask = asyncHandler(async (req, res, next) => {
  const { workspaceId, taskId } = req.params;
  const task = await Task.findOneAndDelete({ _id: taskId, workspaceId });

  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully.'
  });
});

module.exports = {
  getTasksByProject,
  createTask,
  updateTask,
  moveTaskStatus,
  deleteTask
};

const getMyAssignedTasks = asyncHandler(async (req, res, next) => {
  const { workspaceId } = req.params;
  const tasks = await Task.find({
    workspaceId,
    $or: [
      { assigneeId: req.user._id },
      { createdBy: req.user._id }
    ]
  })
    .populate('projectId', 'name status')
    .populate('assigneeId', 'name email avatarColor')
    .sort({ dueDate: 1 });

  res.status(200).json({
    success: true,
    data: { tasks }
  });
});

// module.exports mein getMyAssignedTasks ko bhi include kar dein:
module.exports = {
  getTasksByProject,
  getMyAssignedTasks,
  createTask,
  updateTask,
  moveTaskStatus,
  deleteTask
};