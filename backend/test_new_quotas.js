const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testQuotas() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const testModels = ['gemini-pro-latest', 'gemini-2.5-flash'];
  
  for (const m of testModels) {
    console.log(`--- Testing ${m} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('Hi');
      console.log(`${m} SUCCESS:`, await result.response.text());
    } catch (e) {
      console.log(`${m} FAILED:`, e.message.split('\n')[0]);
    }
  }
}

testQuotas();
