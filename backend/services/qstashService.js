const { Client } = require("@upstash/qstash");
const dotenv = require('dotenv');
dotenv.config();

let client = null;
if (process.env.QSTASH_TOKEN) {
  client = new Client({
    token: process.env.QSTASH_TOKEN,
  });
} else {
  console.warn("⚠️ QSTASH_TOKEN is missing. Reminders will not be cloud-scheduled.");
}

/**
 * Schedule a delayed job on QStash
 * @param {string} url - The endpoint to call
 * @param {object} body - The payload
 * @param {Date} triggerTime - When to trigger
 * @returns {Promise<string>} - The QStash message ID
 */
exports.scheduleReminder = async (url, body, triggerTime) => {
  try {
    const delay = Math.max(0, Math.floor((triggerTime.getTime() - Date.now()) / 1000));
    
    if (!client) return null;

    const res = await client.publishJSON({
      url,
      body,
      delay,
    });
    
    return res.messageId;
  } catch (error) {
    console.error("QStash Schedule Error:", error);
    return null;
  }
};

/**
 * Cancel a QStash job
 * @param {string} messageId - The ID returned by publish
 */
exports.cancelReminder = async (messageId) => {
  try {
    if (!messageId || !client) return;
    await client.messages.delete(messageId);
  } catch (error) {
    console.error("QStash Cancel Error:", error);
  }
};
