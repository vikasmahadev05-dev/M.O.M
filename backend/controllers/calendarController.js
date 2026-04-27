const CalendarItem = require('../models/CalendarItem');
const Reminder = require('../models/Reminder');
const qstashService = require('../services/qstashService');
const User = require('../models/User');
const googleCalendarService = require('../services/googleCalendarService');
const mongoose = require('mongoose');

const calculateTriggerTime = (eventStartTime, offsetValue, offsetUnit) => {
  const date = new Date(eventStartTime);
  if (offsetUnit === 'hours') {
    date.setHours(date.getHours() - offsetValue);
  } else {
    date.setMinutes(date.getMinutes() - offsetValue);
  }
  return date;
};

// Fetch all calendar items for the user
exports.fetchItems = async (req, res) => {
  try {
    const { type, priority, search } = req.query;
    let query = { userId: req.user.id };

    if (type && type !== 'all') query.type = type;
    if (priority && priority !== 'all') query.priority = priority;
    if (search) query.title = { $regex: search, $options: 'i' };

    const items = await CalendarItem.find(query).sort({ startTime: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new calendar item
exports.createItem = async (req, res) => {
  try {
    const { reminders, ...itemData } = req.body;
    const item = new CalendarItem({ ...itemData, userId: req.user.id });
    const savedItem = await item.save();

    if (reminders && reminders.length > 0) {
      for (const r of reminders) {
        const triggerTime = calculateTriggerTime(savedItem.startTime, r.offsetValue, r.offsetUnit);
        const reminder = new Reminder({
          eventId: savedItem._id,
          triggerTime,
          offsetValue: r.offsetValue,
          offsetUnit: r.offsetUnit,
          type: r.type || 'both'
        });
        const triggerUrl = `${process.env.BACKEND_URL}/api/reminders/trigger/${reminder._id}`;
        const qstashId = await qstashService.scheduleReminder(triggerUrl, { reminderId: reminder._id }, triggerTime);
        reminder.qstashMessageId = qstashId;
        await reminder.save();
      }
    }

    const user = await User.findById(req.user.id);
    if (user && user.googleConnected && user.googleSyncEnabled) {
      try {
        console.log(`Syncing new event "${savedItem.title}" to Google Calendar...`);
        const gEvent = await googleCalendarService.createEvent(req.user.id, savedItem);
        savedItem.googleEventId = gEvent.id;
        savedItem.source = 'app';
        savedItem.syncStatus = 'synced';
        savedItem.lastSyncedAt = new Date();
        await savedItem.save();
        console.log(`Successfully synced event to Google. ID: ${gEvent.id}`);
      } catch (err) {
        console.error('❌ Failed to push to Google Calendar:', err.message);
        savedItem.syncStatus = 'failed';
        await savedItem.save();
      }
    }

    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a calendar item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { reminders, ...updateData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Google Event Update
      const user = await User.findById(req.user.id);
      if (user && user.googleConnected) {
        try {
          const updatedEvent = await googleCalendarService.updateEvent(req.user.id, id, req.body);
          return res.json({ message: 'Google event updated', event: updatedEvent });
        } catch (err) {
          return res.status(500).json({ message: 'Failed to update Google event: ' + err.message });
        }
      }
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const updatedItem = await CalendarItem.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });

    // Handle reminders sync (simple approach: delete and recreate)
    if (reminders) {
      const oldReminders = await Reminder.find({ eventId: id });
      for (const or of oldReminders) {
        if (or.qstashMessageId) await qstashService.cancelReminder(or.qstashMessageId);
      }
      await Reminder.deleteMany({ eventId: id });
      
      for (const r of reminders) {
        const triggerTime = calculateTriggerTime(updatedItem.startTime, r.offsetValue, r.offsetUnit);
        const reminder = new Reminder({
          eventId: updatedItem._id,
          triggerTime,
          offsetValue: r.offsetValue,
          offsetUnit: r.offsetUnit,
          type: r.type || 'both'
        });
        const triggerUrl = `${process.env.BACKEND_URL}/api/reminders/trigger/${reminder._id}`;
        const qstashId = await qstashService.scheduleReminder(triggerUrl, { reminderId: reminder._id }, triggerTime);
        reminder.qstashMessageId = qstashId;
        await reminder.save();
      }
    }

    // Sync with Google
    const user = await User.findById(req.user.id);
    if (user && user.googleConnected && user.googleSyncEnabled && updatedItem.googleEventId) {
      try {
        console.log(`Updating event "${updatedItem.title}" in Google Calendar...`);
        await googleCalendarService.updateEvent(req.user.id, updatedItem.googleEventId, updatedItem);
        updatedItem.syncStatus = 'synced';
        updatedItem.lastSyncedAt = new Date();
        await updatedItem.save();
        console.log('Successfully updated event in Google.');
      } catch (err) {
        console.error('❌ Failed to update Google Calendar:', err.message);
        updatedItem.syncStatus = 'failed';
        await updatedItem.save();
      }
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a calendar item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { scope = 'occurrence', date } = req.query;
    
    // Check if it's a valid MongoDB ID
    const isValidMongoId = mongoose.Types.ObjectId.isValid(id);

    if (!isValidMongoId) {
      // It might be a Google Event ID (since they are alphanumeric)
      const user = await User.findById(req.user.id);
      if (user && user.googleConnected) {
        try {
          await googleCalendarService.deleteEvent(req.user.id, id);
          return res.json({ message: 'Google event deleted' });
        } catch (err) {
          return res.status(500).json({ message: 'Failed to delete Google event: ' + err.message });
        }
      }
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const item = await CalendarItem.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (scope === 'all') {
      // Sync with Google (delete entire series)
      const user = await User.findById(req.user.id);
      if (user && user.googleConnected && item.googleEventId) {
        try {
          console.log(`Deleting event "${item.title}" from Google Calendar...`);
          await googleCalendarService.deleteEvent(req.user.id, item.googleEventId);
          console.log('Successfully deleted event from Google.');
        } catch (err) {
          console.error('❌ Failed to delete from Google Calendar:', err.message);
        }
      }

      // Delete associated reminders
      const oldReminders = await Reminder.find({ eventId: id });
      for (const or of oldReminders) {
        if (or.qstashMessageId) await qstashService.cancelReminder(or.qstashMessageId);
      }
      await Reminder.deleteMany({ eventId: id });

      await CalendarItem.findByIdAndDelete(id);
      return res.json({ message: 'Series deleted successfully' });
    } else {
      // scope === 'occurrence'
      if (date) {
        item.excludedDates = item.excludedDates || [];
        item.excludedDates.push(date);
        const updated = await item.save();
        return res.json({ message: 'Instance excluded successfully', item: updated, scope: 'occurrence' });
      } else {
        // Fallback for non-recurring or missing date
        await CalendarItem.findByIdAndDelete(id);
        return res.json({ message: 'Item deleted successfully' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Duplicate an item
exports.duplicateItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const original = await CalendarItem.findById(id);
    if (!original) return res.status(404).json({ message: 'Original item not found' });

    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.googleEventId;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    
    duplicateData.title = `${duplicateData.title} (Copy)`;
    const duplicate = new CalendarItem(duplicateData);
    await duplicate.save();
    
    res.status(201).json(duplicate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
