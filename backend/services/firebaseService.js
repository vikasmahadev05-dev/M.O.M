const admin = require('firebase-admin');

// Note: In production, you'd initialize with process.env.FIREBASE_SERVICE_ACCOUNT
/*
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
});
*/

exports.sendPushNotification = async (token, title, body) => {
  try {
    if (!token) return;
    
    const message = {
      notification: { title, body },
      token
    };
    
    // const response = await admin.messaging().send(message);
    console.log("Mock FCM sent:", title, body);
    return true;
  } catch (error) {
    console.error("FCM Error:", error);
    return false;
  }
};
