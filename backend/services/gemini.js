const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Primary function to generate AI responses.
 * Initialized lazily to ensure environment variables are ready.
 */
async function summarize(text) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in .env file");
    }

    // Initialize only when needed
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Reverting to the model that was confirmed working earlier
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent(text);
    return result.response.text();
  } catch (err) {
    console.error("Gemini Error:", err.message || err);
    throw new Error(err.message || "AI processing failed");
  }
}

module.exports = {
  summarize,
  generateResponse: summarize
};
