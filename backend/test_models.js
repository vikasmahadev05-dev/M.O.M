const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp'];
    
    console.log('Testing models...');
    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            await model.generateContent('Hi');
            console.log(`✅ ${modelName}`);
        } catch (e) {
            console.log(`❌ ${modelName}: ${e.message.split('\n')[0]}`);
        }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
