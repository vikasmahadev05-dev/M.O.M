const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listAllModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There isn't a direct listModels in the new SDK easily accessible without the rest client
    // But we can try to fetch the list via axios as a fallback for debugging
    const axios = require('axios');
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    console.log('Available Models:');
    response.data.models.forEach(m => {
        console.log(`- ${m.name}`);
    });
  } catch (error) {
    console.error('ListModels Error:', error.response?.data?.error?.message || error.message);
  }
}

listAllModels();
