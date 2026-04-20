const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { generateResponse } = require('./services/gemini');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.mongo_uri || process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
.then(async () => {
    console.log('MongoDB connected successfully');
    
    // Seed default tags if none exist
    const Tag = require('./models/Tag');
    const defaultTags = ['#exam', '#meeting', '#idea', '#urgent', '#personal'];
    
    for (const tagName of defaultTags) {
        const exists = await Tag.findOne({ name: tagName });
        if (!exists) {
            await Tag.create({ name: tagName, isDefault: true });
        }
    }
})
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
const noteRoutes = require('./routes/noteRoutes');
const folderRoutes = require('./routes/folderRoutes');
const tagRoutes = require('./routes/tagRoutes');

app.use('/api/notes', noteRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/tags', tagRoutes);

/**
 * GET /api/quote
 * Proxy route to ZenQuotes API or fallback to local static quotes
 * to avoid CORS and handle rate limits.
 */
app.get('/api/quote', async (req, res) => {
  try {
    // Attempt to fetch from ZenQuotes
    const response = await axios.get('https://zenquotes.io/api/random', { timeout: 5000 });
    
    // ZenQuotes returns an array: [{ q: "quote", a: "author", h: "html" }]
    if (response.data && response.data.length > 0) {
      return res.json({
        text: response.data[0].q,
        author: response.data[0].a
      });
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Quote fetch error:', error.message);
    
    // Safe Fallback Quote if API fails
    res.json({
      text: "The best way to predict the future is to create it.",
      author: "Peter Drucker",
      isFallback: true
    });
  }
});

/**
 * POST /api/chat
 * Endpoint for AI bot interactions using Gemini
 */
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const aiResponse = await generateResponse(message);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`M.O.M Backend running on http://localhost:${PORT}`);
});
