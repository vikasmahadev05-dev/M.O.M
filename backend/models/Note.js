const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled Note'
  },
  content: {
    type: String,
    default: ''
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  tags: {
    type: [String],
    default: []
  },

  color: {
    type: String,
    default: 'bg-[var(--pastel-blue)]' // Default to our pastel theme class
  },
  links: [{
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    reason: { type: String, default: '' }
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  reminder: {
    type: Date,
    default: null
  },
  // Persist Graph Positions (null = floating, number = pinned)
  fx: {
    type: Number,
    default: null
  },
  fy: {
    type: Number,
    default: null
  },
  attachments: [{
    url: { type: String, required: true },
    name: { type: String, required: true },
    fileType: { type: String, required: true }, // 'image', 'pdf', 'doc', etc.
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
