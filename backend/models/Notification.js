const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['TASK_ASSIGNED', 'TASK_UPDATED', 'COMMENT_ADDED', 'WORKSPACE_INVITE'], 
    required: true 
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);