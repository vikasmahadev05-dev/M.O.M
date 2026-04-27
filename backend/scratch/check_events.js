const mongoose = require('mongoose');
const CalendarItem = require('../models/CalendarItem');
const User = require('../models/User');
require('dotenv').config();

async function checkEvents() {
  await mongoose.connect(process.env.mongo_uri || process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'vikas@example.com' }); // Assuming email or I can find by username
  if (!user) {
    const allUsers = await User.find({});
    console.log('Users found:', allUsers.map(u => u.username));
    // Pick the first one for now or use vikas
    const vUser = allUsers.find(u => u.username.toLowerCase().includes('vikas')) || allUsers[0];
    if (!vUser) return;
    
    const events = await CalendarItem.find({ userId: vUser._id });
    console.log(`Events for ${vUser.username}:`, events.length);
    events.forEach(e => {
      console.log(`- ${e.title} (${e.startTime}) [Source: ${e.source}]`);
    });
  }
  process.exit();
}

checkEvents();
