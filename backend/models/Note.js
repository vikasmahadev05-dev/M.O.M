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
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
