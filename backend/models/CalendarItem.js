const mongoose = require('mongoose');

const calendarItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['event', 'task', 'reminder'],
    default: 'task'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  allDay: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['work', 'personal', 'custom', 'none'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  colorTag: {
    type: String,
    default: '#6366f1'
  },
  location: {
    type: String,
    trim: true
  },
  recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'custom'], default: 'none' },
  recurrenceInterval: { type: Number, default: 1 },
  recurrenceDays: [String], // e.g., ['Monday', 'Wednesday']
  recurrenceEndDate: Date,
  recurrenceId: String, // Group ID for a series
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CalendarItem' }, // For exceptions in a series
  recurrenceRule: {
    daysOfWeek: [Number], // 0-6 for Sun-Sat
    interval: Number,
    endDate: Date
  },
  excludedDates: [String], // ISO strings of instance start times to hide
  reminderTime: {
    type: [Date] // Multiple reminders supported
  },
  attachments: [{
    name: String,
    url: String,
    fileType: String
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  parentId: { // For recurring instances if we save them individually, or for series link
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarItem'
  },
  googleEventId: {
    type: String,
    sparse: true // Allow multiple nulls
  },
  source: {
    type: String,
    enum: ['app', 'google'],
    default: 'app'
  },
  lastSyncedAt: Date,
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CalendarItem', calendarItemSchema);
