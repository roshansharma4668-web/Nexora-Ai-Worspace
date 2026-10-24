const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  status: { 
    type: String, 
    enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'], 
    default: 'Planning',
    index: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'], 
    default: 'Medium' 
  },
  startDate: { type: Date, default: Date.now },
  deadline: { type: Date, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isArchived: { type: Boolean, default: false, index: true }
}, { timestamps: true });

projectSchema.index({ workspaceId: 1, name: 1 });

module.exports = mongoose.model('Project', projectSchema);