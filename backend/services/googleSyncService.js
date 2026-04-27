const CalendarItem = require('../models/CalendarItem');
const googleCalendarService = require('./googleCalendarService');
const User = require('../models/User');

/**
 * Sync events from Google Calendar to the App Database
 */
exports.syncGoogleToApp = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.googleConnected) return { success: false, message: 'User not connected' };

  try {
    const googleEvents = await googleCalendarService.fetchEvents(userId);
    const syncResults = { created: 0, updated: 0, skipped: 0 };

    for (const gEvent of googleEvents) {
      const existingItem = await CalendarItem.findOne({ googleEventId: gEvent.id, userId });

      const gUpdatedAt = new Date(gEvent.updated);
      
      if (!existingItem) {
        // Determine color based on calendar type
        let colorTag = '#9333ea'; // Default Google Purple
        if (gEvent.calendarName && gEvent.calendarName.toLowerCase().includes('holiday')) {
          colorTag = '#ef4444'; // Red for holidays
        } else if (gEvent.calendarName && gEvent.calendarName.toLowerCase().includes('birthday')) {
          colorTag = '#ec4899'; // Pink for birthdays
        }

        // Create new local event from Google
        const newItem = new CalendarItem({
          userId,
          title: gEvent.summary || '(No Title)',
          description: (gEvent.description || '') + (gEvent.calendarName ? `\n[Calendar: ${gEvent.calendarName}]` : ''),
          startTime: new Date(gEvent.start.dateTime || gEvent.start.date),
          endTime: new Date(gEvent.end.dateTime || gEvent.end.date),
          location: gEvent.location || '',
          type: 'event',
          source: 'google',
          googleEventId: gEvent.id,
          syncStatus: 'synced',
          lastSyncedAt: new Date(),
          colorTag: colorTag
        });
        await newItem.save();
        syncResults.created++;
      } else {
        // Check for updates (Conflict Resolution)
        const localUpdatedAt = existingItem.updatedAt;
        
        if (gUpdatedAt > localUpdatedAt) {
          // Google is newer, update local
          existingItem.title = gEvent.summary || existingItem.title;
          existingItem.description = gEvent.description || existingItem.description;
          existingItem.startTime = new Date(gEvent.start.dateTime || gEvent.start.date);
          existingItem.endTime = new Date(gEvent.end.dateTime || gEvent.end.date);
          existingItem.location = gEvent.location || existingItem.location;
          existingItem.lastSyncedAt = new Date();
          existingItem.syncStatus = 'synced';
          
          await existingItem.save();
          syncResults.updated++;
        } else {
          syncResults.skipped++;
        }
      }
    }

    return { success: true, ...syncResults };
  } catch (error) {
    console.error('Sync Google to App Error:', error);
    throw error;
  }
};

/**
 * Sync events from App Database to Google Calendar
 * (Mostly used for pending items or full repair sync)
 */
exports.syncAppToGoogle = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.googleConnected) return { success: false, message: 'User not connected' };

  try {
    // Find app events that haven't been synced or were created in app
    const appEvents = await CalendarItem.find({ 
      userId, 
      source: 'app',
      $or: [
        { googleEventId: { $exists: false } },
        { googleEventId: null },
        { syncStatus: 'pending' }
      ]
    });

    const syncResults = { pushed: 0, updated: 0, failed: 0 };

    for (const item of appEvents) {
      try {
        if (!item.googleEventId) {
          // Create in Google
          const gEvent = await googleCalendarService.createEvent(userId, item);
          item.googleEventId = gEvent.id;
          item.syncStatus = 'synced';
          item.lastSyncedAt = new Date();
          await item.save();
          syncResults.pushed++;
        } else {
          // Update in Google
          await googleCalendarService.updateEvent(userId, item.googleEventId, item);
          item.syncStatus = 'synced';
          item.lastSyncedAt = new Date();
          await item.save();
          syncResults.updated++;
        }
      } catch (err) {
        console.error(`Failed to sync item ${item._id}:`, err.message);
        item.syncStatus = 'failed';
        await item.save();
        syncResults.failed++;
      }
    }

    return { success: true, ...syncResults };
  } catch (error) {
    console.error('Sync App to Google Error:', error);
    throw error;
  }
};
