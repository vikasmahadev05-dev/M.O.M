const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testCurrentConfig() {
  try {
    console.log('Testing with API Key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const modelName = 'gemini-1.5-flash';
    console.log(`Attempting to connect to: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hi');
    console.log('SUCCESS: ', await result.response.text());
  } catch (error) {
    console.error('FAILURE DETAILS:');
    console.error('- Message:', error.message);
    if (error.response) {
      console.error('- Status:', error.response.status);
      console.error('- Body:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCurrentConfig();
