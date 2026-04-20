const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Google Generative AI with the API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-flash-latest which was confirmed in your project's model list
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

/**
 * Generate a response from Gemini using Google AI Studio
 * @param {string} prompt - The user's message
 * @returns {Promise<string>} - The AI response
 */
async function generateResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}

module.exports = {
  generateResponse
};
