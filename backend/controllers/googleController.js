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

  console.log('--- Google OAuth Callback ---');
  console.log('User ID from state:', userId);
  console.log('Auth Code present:', !!code);

  try {
    if (!userId) {
      console.error('Callback Error: No userId found in state parameter');
      throw new Error('No userId found in state');
    }

    if (!code) {
      console.error('Callback Error: No auth code received from Google');
      throw new Error('No auth code received from Google');
    }

    console.log('Exchanging code for tokens...');
    await googleAuthService.saveTokensFromCode(userId, code);
    
    // Enable sync by default on connect
    console.log('Enabling sync for user:', userId);
    await User.findByIdAndUpdate(userId, { googleSyncEnabled: true });

    // Robust redirect: Use FRONTEND_URL or fallback to current origin
    let frontendUrl = process.env.FRONTEND_URL;
    
    // Fallback logic: If FRONTEND_URL is missing or localhost (when in production)
    if (!frontendUrl || frontendUrl.includes('localhost')) {
      const requestHost = req.get('host');
      const protocol = req.protocol;
      
      // If we're on Render (or similar), req.get('host') will be the backend URL.
      // If FRONTEND_URL is not set, we try to guess it or at least use the current host.
      if (requestHost.includes('onrender.com') && !frontendUrl) {
         // Attempt to guess frontend URL if it follows a pattern, but safer to just use current host
         // and hope they are served together or the user fixes the ENV.
         frontendUrl = `${protocol}://${requestHost}`;
      } else if (!frontendUrl) {
         frontendUrl = 'http://localhost:5173'; // Dev default
      }
    }

    // Remove trailing slash if present
    if (frontendUrl.endsWith('/')) {
      frontendUrl = frontendUrl.slice(0, -1);
    }

    const finalRedirect = `${frontendUrl}/calendar?google=connected`;
    console.log('Final Redirect URL:', finalRedirect);
    
    // Standard 302 redirect is more robust against security policies like Trusted Types
    // than sending an HTML page with a script tag.
    return res.redirect(finalRedirect);
  } catch (error) {
    console.error('Google Callback Critical Error:', error.message);
    
    // Robust error redirect or response
    let frontendUrl = process.env.FRONTEND_URL || '';
    if (frontendUrl.endsWith('/')) frontendUrl = frontendUrl.slice(0, -1);
    
    const errorRedirect = frontendUrl ? `${frontendUrl}/calendar?error=sync_failed` : null;
    
    if (errorRedirect) {
      return res.redirect(errorRedirect);
    }

    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc;">
          <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; text-align: center;">
            <h1 style="color: #ef4444; margin-bottom: 1rem;">Sync Connection Failed</h1>
            <p style="color: #64748b; margin-bottom: 2rem;">${error.message}</p>
            <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 2rem;">Please ensure FRONTEND_URL is set correctly in your environment variables.</p>
            <button onclick="window.location.href='/calendar'" style="background: #0f172a; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold;">
              Go Back
            </button>
          </div>
        </body>
      </html>
    `);
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
