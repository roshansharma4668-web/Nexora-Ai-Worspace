const Comment = require('../models/Comment');
const Task = require('../models/Task');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getCommentsByTask = asyncHandler(async (req, res, next) => {
  const { workspaceId, taskId } = req.params;
  const comments = await Comment.find({ workspaceId, taskId })
    .populate('authorId', 'name email avatarColor')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    data: { comments }
  });
});

const createComment = asyncHandler(async (req, res, next) => {
  const { workspaceId, taskId } = req.params;
  const { content } = req.body;

  const task = await Task.findOne({ _id: taskId, workspaceId });
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  const comment = await Comment.create({
    workspaceId,
    projectId: task.projectId,
    taskId,
    authorId: req.user._id,
    content
  });

  const populatedComment = await Comment.findById(comment._id).populate('authorId', 'name email avatarColor');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully.',
    data: { comment: populatedComment }
  });
});

module.exports = {
  getCommentsByTask,
  createComment
};