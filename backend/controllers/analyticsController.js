const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

const getWorkspaceOverview = asyncHandler(async (req, res, next) => {
  const { workspaceId } = req.params;
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  const totalProjects = await Project.countDocuments({ workspaceId, isArchived: false });
  const totalTasks = await Task.countDocuments({ workspaceId });
  const completedTasks = await Task.countDocuments({ workspaceId, status: 'Completed' });

  const now = new Date();
  const overdueTasks = await Task.countDocuments({
    workspaceId,
    status: { $ne: 'Completed' },
    dueDate: { $lt: now }
  });

  const tasksByStatusRaw = await Task.aggregate([
    { $match: { workspaceId: wsObjectId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const tasksByPriorityRaw = await Task.aggregate([
    { $match: { workspaceId: wsObjectId } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  const recentActivities = await ActivityLog.find({ workspaceId })
    .populate('actorId', 'name email avatarColor')
    .sort({ createdAt: -1 })
    .limit(6);

  const upcomingDeadlines = await Project.find({
    workspaceId,
    isArchived: false,
    deadline: { $gte: now }
  })
    .sort({ deadline: 1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      kpis: {
        totalProjects,
        totalTasks,
        completedTasks,
        overdueTasks
      },
      tasksByStatus: tasksByStatusRaw.map((item) => ({ name: item._id, count: item.count })),
      tasksByPriority: tasksByPriorityRaw.map((item) => ({ name: item._id, count: item.count })),
      recentActivities,
      upcomingDeadlines
    }
  });
});

module.exports = {
  getWorkspaceOverview
};