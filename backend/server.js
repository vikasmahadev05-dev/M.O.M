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
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const MONGODB_URI = process.env.mongo_uri || process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables!');
} else {
    console.log('Connecting to MongoDB...');
    mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log(`MongoDB Connected Successfully to: ${mongoose.connection.name} ✅`);
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
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('Full error details:', err);
    });
}

// Routes
const noteRoutes = require('./routes/noteRoutes');
const folderRoutes = require('./routes/folderRoutes');
const tagRoutes = require('./routes/tagRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const calendarRoutes = require('./routes/calendarRoutes');


// Health Check / Welcome Route
app.get('/', (req, res) => {
  res.send('🚀 M.O.M Backend is Live and Running!');
});

app.use('/api/notes', noteRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/google', require('./routes/googleRoutes'));


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

// Real-time Notifications Setup
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected for real-time notifications:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`M.O.M Backend running on port ${PORT} (Real-time Enabled)`);
});
