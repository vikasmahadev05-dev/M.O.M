const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../backend/.env' });

async function listModels() {
  try {
    console.log('Using API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // In newer SDKs, we can't easily list models from the AI object 
    // but we can try to initialize the most basic one.
    const models = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp'];
    
    console.log('\nTesting models individually...\n');
    
    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            const response = await result.response;
            console.log(`✅ ${modelName}: SUCCESS`);
        } catch (e) {
            console.log(`❌ ${modelName}: FAILED (${e.message})`);
        }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
