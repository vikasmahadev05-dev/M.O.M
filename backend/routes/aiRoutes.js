const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Define AI Endpoints
router.post('/summarize', aiController.summarizeNote);
router.post('/tasks', aiController.extractTasks);
router.post('/analyze', aiController.analyzeNote);

module.exports = router;
