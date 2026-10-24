const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const { generateProjectPlanFromAI } = require('../services/aiService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const checkAiStatus = asyncHandler(async (req, res, next) => {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY);
  res.status(200).json({
    success: true,
    data: { isConfigured, provider: process.env.AI_PROVIDER || 'gemini' }
  });
});

const generatePlan = asyncHandler(async (req, res, next) => {
  const { description } = req.body;

  try {
    const suggestedTasks = await generateProjectPlanFromAI(description);
    res.status(200).json({
      success: true,
      message: 'AI generated project breakdown successfully.',
      data: { suggestedTasks }
    });
  } catch (error) {
    return next(new AppError(error.message, 502));
  }
});

const confirmAndSaveTasks = asyncHandler(async (req, res, next) => {
  const { workspaceId, projectId } = req.params;
  const { tasks } = req.body;

  const project = await Project.findOne({ _id: projectId, workspaceId });
  if (!project) {
    return next(new AppError('Project not found in this workspace.', 404));
  }

  const createdTasks = [];
  const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now

  for (const t of tasks) {
    const newTask = await Task.create({
      workspaceId,
      projectId,
      title: t.title,
      description: t.description || '',
      status: 'Todo',
      priority: t.priority || 'Medium',
      estimatedHours: t.estimatedHours || 4,
      labels: t.labels || ['AI-Generated'],
      dueDate: defaultDueDate,
      createdBy: req.user._id,
      assigneeId: req.user._id
    });

    createdTasks.push(newTask);
  }

  await ActivityLog.create({
    workspaceId,
    projectId,
    actorId: req.user._id,
    action: 'AI_TASKS_GENERATED',
    details: `Added ${createdTasks.length} AI-generated tasks to project "${project.name}"`
  });

  res.status(201).json({
    success: true,
    message: `${createdTasks.length} tasks successfully added to project.`,
    data: { tasks: createdTasks }
  });
});

module.exports = {
  checkAiStatus,
  generatePlan,
  confirmAndSaveTasks
};