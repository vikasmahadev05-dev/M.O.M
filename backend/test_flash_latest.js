const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testWorkingModel() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = 'gemini-flash-latest'; // This was ✅ in the capability check
    console.log(`Connecting to: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hi');
    console.log('SUCCESS:', await result.response.text());
  } catch (error) {
    console.log('FAILED:', error.message.split('\n')[0]);
  }
}

testWorkingModel();
