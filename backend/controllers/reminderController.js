const Reminder = require('../models/Reminder');
const CalendarItem = require('../models/CalendarItem');
const qstashService = require('../services/qstashService');
const firebaseService = require('../services/firebaseService');

// Helper to calculate trigger time
const calculateTriggerTime = (eventStartTime, offsetValue, offsetUnit) => {
  const date = new Date(eventStartTime);
  if (offsetUnit === 'hours') {
    date.setHours(date.getHours() - offsetValue);
  } else {
    date.setMinutes(date.getMinutes() - offsetValue);
  }
  return date;
};

exports.createReminder = async (req, res) => {
  try {
    const { eventId, offsetValue, offsetUnit, type } = req.body;
    const event = await CalendarItem.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const triggerTime = calculateTriggerTime(event.startTime, offsetValue, offsetUnit);
    
    const reminder = new Reminder({
      eventId,
      triggerTime,
      offsetValue,
      offsetUnit,
      type
    });

    // Schedule QStash job
    const triggerUrl = `${process.env.BACKEND_URL}/api/reminders/trigger/${reminder._id}`;
    const qstashId = await qstashService.scheduleReminder(triggerUrl, { reminderId: reminder._id }, triggerTime);
    
    reminder.qstashMessageId = qstashId;
    await reminder.save();

    res.status(201).json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRemindersByEvent = async (req, res) => {
  try {
    const reminders = await Reminder.find({ eventId: req.params.eventId });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    // Cancel QStash job
    if (reminder.qstashMessageId) {
      await qstashService.cancelReminder(reminder.qstashMessageId);
    }

    await Reminder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Webhook for QStash to trigger
exports.triggerReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id).populate('eventId');
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    if (reminder.status !== 'pending') return res.status(200).json({ message: "Already processed" });

    // Send Push Notification
    if (reminder.type === 'push' || reminder.type === 'both') {
      // Assuming user token is available via some user service/model
      const userToken = "MOCK_TOKEN"; 
      await firebaseService.sendPushNotification(
        userToken, 
        "Reminder", 
        `${reminder.eventId.title} starts in ${reminder.offsetValue} ${reminder.offsetUnit}`
      );
    }

    reminder.status = 'triggered';
    await reminder.save();

    // If the parent item is a 'reminder' (not a task/event), mark it as completed
    // so it disappears from the calendar/upcoming list automatically
    if (reminder.eventId && reminder.eventId.type === 'reminder') {
      const CalendarItem = require('../models/CalendarItem');
      await CalendarItem.findByIdAndUpdate(reminder.eventId._id, { status: 'completed' });
    }

    // Real-time notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('reminder:triggered', reminder);
    }

    res.status(200).json({ message: "Triggered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.snoozeReminder = async (req, res) => {
  try {
    const { minutes } = req.body;
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    // Cancel old QStash job
    if (reminder.qstashMessageId) {
      await qstashService.cancelReminder(reminder.qstashMessageId);
    }

    const newTriggerTime = new Date(Date.now() + minutes * 60000);
    const triggerUrl = `${process.env.BACKEND_URL}/api/reminders/trigger/${reminder._id}`;
    const qstashId = await qstashService.scheduleReminder(triggerUrl, { reminderId: reminder._id }, newTriggerTime);

    reminder.triggerTime = newTriggerTime;
    reminder.qstashMessageId = qstashId;
    reminder.status = 'pending';
    await reminder.save();

    res.status(200).json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.dismissReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByIdAndUpdate(id, { status: 'dismissed' }, { new: true });
    
    // If it's a dedicated reminder item, mark parent as completed too
    const CalendarItem = require('../models/CalendarItem');
    const r = await Reminder.findById(id).populate('eventId');
    if (r && r.eventId && r.eventId.type === 'reminder') {
      await CalendarItem.findByIdAndUpdate(r.eventId._id, { status: 'completed' });
    }

    res.status(200).json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPendingReminders = async (req, res) => {
  try {
    const now = new Date();
    
    // Cleanup: Mark very old (e.g. > 10 min) pending reminders as triggered
    const tenMinsAgo = new Date(now.getTime() - 10 * 60000);
    await Reminder.updateMany(
      { status: 'pending', triggerTime: { $lt: tenMinsAgo } },
      { status: 'triggered' }
    );

    const reminders = await Reminder.find({
      status: 'pending'
    }).populate('eventId');
    
    res.status(200).json(reminders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
