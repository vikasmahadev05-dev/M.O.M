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

    // Robust redirect: Use FRONTEND_URL or fallback to relative path
    let frontendUrl = process.env.FRONTEND_URL || '';
    
    // If FRONTEND_URL is still localhost but we're on a production-like host, 
    // it's likely a misconfiguration. We should try to use the request host.
    const requestHost = req.get('host');
    const protocol = req.protocol;
    const currentOrigin = `${protocol}://${requestHost}`;

    if (!frontendUrl || frontendUrl.includes('localhost')) {
      console.log('FRONTEND_URL missing or localhost. Falling back to current origin:', currentOrigin);
      frontendUrl = currentOrigin;
    }

    // Remove trailing slash if present
    if (frontendUrl.endsWith('/')) {
      frontendUrl = frontendUrl.slice(0, -1);
    }

    const finalRedirect = `${frontendUrl}/calendar?google=connected`;
    console.log('Redirecting user to:', finalRedirect);
    
    // Use an HTML-based redirect for better reliability on mobile browsers
    // and to avoid some COOP/CORS redirect issues.
    res.send(`
      <html>
        <head>
          <title>Redirecting to M.O.M...</title>
          <meta http-equiv="refresh" content="0;url=${finalRedirect}">
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fdfaf7; color: #1a1a1a; }
            .loader { border: 3px solid #f3f3f3; border-top: 3px solid #6366f1; border-radius: 50%; width: 24px; height: 24px; animate: spin 1s linear infinite; margin-right: 12px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <p>Sync successful! Redirecting you back to M.O.M...</p>
          <script>
            window.location.href = "${finalRedirect}";
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Google Callback Critical Error:', error.message);
    
    // Send a more descriptive response if it's a browser navigation
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc;">
          <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; text-align: center;">
            <h1 style="color: #ef4444; margin-bottom: 1rem;">Sync Connection Failed</h1>
            <p style="color: #64748b; margin-bottom: 2rem;">${error.message}</p>
            <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 2rem;">Please check your environment variables (FRONTEND_URL, GOOGLE_REDIRECT_URI) and ensure they match your deployment.</p>
            <button onclick="window.location.href='/calendar'" style="background: #0f172a; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold;">
              Go Back to App
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
