const { google } = require('googleapis');
const User = require('../models/User');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Get the OAuth URL for the user to authorize
 */
exports.getAuthUrl = (userId) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/tasks.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: userId // Pass userId to identify them in the callback
  });
};

/**
 * Handle callback from Google and save tokens
 */
exports.saveTokensFromCode = async (userId, code) => {
  console.log('Initiating token exchange for user:', userId);
  
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await client.getToken(code);
    console.log('Successfully received tokens from Google');
    
    const updateData = {
      googleConnected: true,
      googleAccessToken: tokens.access_token,
    };

    if (tokens.refresh_token) {
      console.log('Refresh token received and will be saved');
      updateData.googleRefreshToken = tokens.refresh_token;
    } else {
      console.warn('No refresh token received. User may need to re-authorize with prompt=consent');
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      console.error('User not found in database during token save:', userId);
      throw new Error('User not found during token save');
    }

    console.log('User tokens updated successfully in DB');
    return tokens;
  } catch (error) {
    console.error('Error in saveTokensFromCode:', error.message);
    throw error;
  }
};

/**
 * Get an authorized client for a specific user
 */
exports.getAuthorizedClient = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.googleConnected) {
    throw new Error('User not connected to Google Calendar');
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken
  });

  // Handle token refresh automatically
  client.on('tokens', async (tokens) => {
    const update = { googleAccessToken: tokens.access_token };
    if (tokens.refresh_token) update.googleRefreshToken = tokens.refresh_token;
    await User.findByIdAndUpdate(userId, update);
  });

  return client;
};
