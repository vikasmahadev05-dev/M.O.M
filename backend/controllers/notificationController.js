const User = require('../models/User');
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:support@mom-sanctuary.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, { pushSubscription: subscription });
    
    res.status(201).json({ message: 'Push subscription saved successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendNotification = async (userId, title, body) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushSubscription) return false;

    const payload = JSON.stringify({
      title: title || 'M.O.M Reminder',
      body: body || 'You have an upcoming event.',
      icon: '/favicon.svg'
    });

    await webpush.sendNotification(user.pushSubscription, payload);
    return true;
  } catch (error) {
    console.error('Push Notification Error:', error);
    // If subscription is expired/invalid, we should ideally remove it
    if (error.statusCode === 410 || error.statusCode === 404) {
      await User.findByIdAndUpdate(userId, { pushSubscription: null });
    }
    return false;
  }
};
