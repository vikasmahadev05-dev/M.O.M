const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarItem',
    required: true
  },
  triggerTime: {
    type: Date,
    required: true
  },
  offsetValue: {
    type: Number,
    required: true
  },
  offsetUnit: {
    type: String,
    enum: ['minutes', 'hours'],
    default: 'minutes'
  },
  type: {
    type: String,
    enum: ['in-app', 'push', 'both'],
    default: 'both'
  },
  status: {
    type: String,
    enum: ['pending', 'triggered', 'snoozed', 'dismissed'],
    default: 'pending'
  },
  qstashMessageId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reminder', reminderSchema);
