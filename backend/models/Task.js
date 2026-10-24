const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  status: { 
    type: String, 
    enum: ['Todo', 'In Progress', 'In Review', 'Completed'], 
    default: 'Todo',
    index: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'], 
    default: 'Medium',
    index: true 
  },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  labels: [{ type: String, trim: true }],
  order: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

taskSchema.index({ workspaceId: 1, projectId: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);