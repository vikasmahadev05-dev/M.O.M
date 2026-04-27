const googleAuthService = require('../services/googleAuthService');
const googleCalendarService = require('../services/googleCalendarService');
const User = require('../models/User');

exports.getConnectUrl = async (req, res) => {
  try {
    const url = googleAuthService.getAuthUrl(req.user.id);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.callback = async (req, res) => {
  const { code, state } = req.query; 
  const userId = state; 

  try {
    if (!userId) throw new Error('No userId found in state');
    await googleAuthService.saveTokensFromCode(userId, code);
    // Enable sync by default on connect
    await User.findByIdAndUpdate(userId, { googleSyncEnabled: true });
    res.redirect(`${process.env.FRONTEND_URL}/calendar?google=connected`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ 
      connected: !!user?.googleConnected,
      syncEnabled: !!user?.googleSyncEnabled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleSync = async (req, res) => {
  try {
    const { enabled } = req.body;
    await User.findByIdAndUpdate(req.user.id, { googleSyncEnabled: enabled });
    res.json({ success: true, syncEnabled: enabled });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleSyncService = require('../services/googleSyncService');

exports.fetchGoogleEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || !user.googleConnected || !user.googleSyncEnabled) {
      return res.json([]);
    }

    // Trigger a background sync to the DB first
    // We don't necessarily need to wait for it to finish for the UI fetch, 
    // but it's better for consistency
    await googleSyncService.syncGoogleToApp(userId);

    const events = await googleCalendarService.fetchEvents(userId);
    res.json(events);
  } catch (error) {
    console.error('Fetch Google Events Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.disconnect = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      googleConnected: false,
      googleSyncEnabled: false,
      googleAccessToken: null,
      googleRefreshToken: null
    });
    res.json({ message: 'Disconnected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
