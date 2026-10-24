const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, trim: true },
  details: { type: String, default: '', trim: true }
}, { timestamps: true });

module.exports = ActivityLog = mongoose.model('ActivityLog', activityLogSchema);