const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testVersionConfig() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Testing v1 instead of v1beta
    console.log('--- Testing v1 endpoint ---');
    try {
        const modelV1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
        const resV1 = await modelV1.generateContent('Hi');
        console.log('v1 SUCCESS:', await resV1.response.text());
    } catch (e) {
        console.log('v1 FAILED:', e.message.split('\n')[0]);
    }

    // Testing gemini-pro (v1beta)
    console.log('\n--- Testing gemini-pro (v1beta) ---');
    try {
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resPro = await modelPro.generateContent('Hi');
        console.log('gemini-pro SUCCESS:', await resPro.response.text());
    } catch (e) {
        console.log('gemini-pro FAILED:', e.message.split('\n')[0]);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testVersionConfig();
