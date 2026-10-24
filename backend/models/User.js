const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  avatarColor: { type: String, default: '#4f46e5' },
  themePreference: { type: String, enum: ['light', 'dark'], default: 'light' },
  lastActiveWorkspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);