const axios = require('axios');
require('dotenv').config();

async function testManualGeneration() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const data = {
    contents: [{
      parts: [{ text: "Write a 3 word summary of the moon." }]
    }]
  };

  try {
    console.log('--- Testing Manual REST (v1beta) ---');
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('SUCCESS:', response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.log('FAILED (v1beta):', error.response?.data?.error?.message || error.message);
    
    // Try v1
    console.log('\n--- Testing Manual REST (v1) ---');
    const urlV1 = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    try {
      const responseV1 = await axios.post(urlV1, data, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('SUCCESS (v1):', responseV1.data.candidates[0].content.parts[0].text);
    } catch (err) {
      console.log('FAILED (v1):', err.response?.data?.error?.message || err.message);
    }
  }
}

testManualGeneration();
