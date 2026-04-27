const { google } = require('googleapis');
const googleAuthService = require('./googleAuthService');

/**
 * Fetch events from all Google Calendars for the user
 */
exports.fetchEvents = async (userId, timeMin) => {
  const auth = await googleAuthService.getAuthorizedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  // If no timeMin provided, default to the start of the current month
  if (!timeMin) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    timeMin = startOfMonth.toISOString();
  }

  let calendars = [];
  try {
    // 1. Get all calendars for the user
    const calendarList = await calendar.calendarList.list();
    calendars = calendarList.data.items || [];
  } catch (err) {
    console.error('Error fetching calendar list:', err.message);
    // If we can't list calendars (likely permission issues), fall back to primary only
    calendars = [{ id: 'primary', summary: 'Primary Calendar' }];
  }

  let allEvents = [];

  // 2. Fetch events from each calendar
  for (const cal of calendars) {
    try {
      const response = await calendar.events.list({
        calendarId: cal.id,
        timeMin: timeMin,
        maxResults: 100, 
        singleEvents: true,
        orderBy: 'startTime',
      });

      const eventsWithSource = (response.data.items || []).map(event => ({
        ...event,
        calendarName: cal.summary,
        calendarId: cal.id
      }));

      allEvents = [...allEvents, ...eventsWithSource];
    } catch (err) {
      console.warn(`Could not fetch events for calendar ${cal.summary || cal.id}:`, err.message);
      // Continue with other calendars
    }
  }

  return allEvents;
};

/**
 * Create an event in Google Calendar
 */
exports.createEvent = async (userId, eventData) => {
  const auth = await googleAuthService.getAuthorizedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: eventData.title,
    description: eventData.description,
    start: {
      dateTime: new Date(eventData.startTime).toISOString(),
    },
    end: {
      dateTime: new Date(eventData.endTime).toISOString(),
    },
    colorId: '5' // Lavender/Sage to match M.O.M aesthetic
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });

  return response.data;
};

/**
 * Update an existing Google Calendar event
 */
exports.updateEvent = async (userId, googleEventId, eventData) => {
  const auth = await googleAuthService.getAuthorizedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  // Build resource conditionally for partial updates
  const event = {};
  if (eventData.title) event.summary = eventData.title;
  if (eventData.description !== undefined) event.description = eventData.description;
  if (eventData.startTime) {
    event.start = { dateTime: new Date(eventData.startTime).toISOString() };
  }
  if (eventData.endTime) {
    event.end = { dateTime: new Date(eventData.endTime).toISOString() };
  }

  const response = await calendar.events.patch({
    calendarId: 'primary',
    eventId: googleEventId,
    resource: event,
  });

  return response.data;
};

/**
 * Delete a Google Calendar event
 */
exports.deleteEvent = async (userId, googleEventId) => {
  const auth = await googleAuthService.getAuthorizedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: googleEventId,
  });
};
