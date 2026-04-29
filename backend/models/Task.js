const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'archived'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  category: {
    type: String,
    default: 'Personal' // Work, Study, Personal, etc.
  },
  tags: [{
    type: String,
    trim: true
  }],
  subtasks: [{
    title: String,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  attachments: [{
    name: String,
    url: String,
    type: { type: String, enum: ['link', 'file'] }
  }],
  color: {
    type: String,
    default: '#ffffff'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-populate completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
