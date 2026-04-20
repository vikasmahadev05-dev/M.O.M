const axios = require('axios');
require('dotenv').config();

async function checkSupportedMethods() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    console.log('Model Compatibility Check:');
    response.data.models.forEach(m => {
        const canGenerate = m.supportedGenerationMethods.includes('generateContent');
        if (canGenerate && m.name.includes('flash')) {
            console.log(`✅ ${m.name} [Supports generateContent]`);
        } else if (m.name.includes('flash')) {
            console.log(`❌ ${m.name} [Methods: ${m.supportedGenerationMethods.join(', ')}]`);
        }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSupportedMethods();
