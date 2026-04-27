const { google } = require('googleapis');
const mongoose = require('mongoose');
const User = require('../models/User');
const googleAuthService = require('../services/googleAuthService');
require('dotenv').config();

async function debugCalendars() {
  await mongoose.connect(process.env.mongo_uri || process.env.MONGODB_URI);
  const user = await User.findOne({ username: /vikas/i });
  if (!user) {
    console.log('User not found');
    process.exit();
  }

  const auth = await googleAuthService.getAuthorizedClient(user._id);
  const calendar = google.calendar({ version: 'v3', auth });

  const calendarList = await calendar.calendarList.list();
  console.log(`Found ${calendarList.data.items.length} calendars:`);
  
  for (const cal of calendarList.data.items) {
    console.log(`- ${cal.summary} (ID: ${cal.id})`);
    try {
      const events = await calendar.events.list({
        calendarId: cal.id,
        timeMin: '2026-04-27T00:00:00Z',
        timeMax: '2026-04-30T23:59:59Z',
        singleEvents: true
      });
      console.log(`  Events found (Apr 27-30): ${events.data.items.length}`);
      events.data.items.forEach(e => {
        console.log(`    * ${e.summary} (${e.start.dateTime || e.start.date})`);
      });
    } catch (err) {
      console.log(`  Error fetching events: ${err.message}`);
    }
  }
  process.exit();
}

debugCalendars();
