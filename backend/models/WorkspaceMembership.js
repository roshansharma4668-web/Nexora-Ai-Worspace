const mongoose = require('mongoose');

const workspaceMembershipSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member', required: true }
}, { timestamps: true });

// Prevent duplicate membership for the same user in the same workspace
workspaceMembershipSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('WorkspaceMembership', workspaceMembershipSchema);