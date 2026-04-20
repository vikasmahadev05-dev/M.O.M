const { generateResponse } = require('../services/gemini');

/**
 * Summarize note content
 */
exports.summarizeNote = async (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    try {
        const prompt = `Summarize this note clearly in short points:\n\n${content}`;
        const summary = await generateResponse(prompt);
        res.json({ summary });
    } catch (error) {
        console.error('Summarize error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to summarize note' });
    }
};

/**
 * Extract actionable tasks
 */
exports.extractTasks = async (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    try {
        const prompt = `Extract actionable tasks from this note. Return them as a clean list:\n\n${content}`;
        const tasks = await generateResponse(prompt);
        res.json({ tasks });
    } catch (error) {
        console.error('Task extraction error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to extract tasks' });
    }
};

/**
 * Analyze note for tasks and deadlines
 */
exports.analyzeNote = async (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    try {
        const prompt = `Analyze this note and extract tasks and deadlines. Return ONLY a JSON object with "tasks" (array of strings) and "deadlines" (array of objects with "task" and "date" keys):\n\n${content}`;
        const analysisText = await generateResponse(prompt);
        
        // Basic JSON parsing from AI response (strip markdown if needed)
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { tasks: [], deadlines: [] };
        
        res.json(analysis);
    } catch (error) {
        console.error('Analysis error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to analyze note' });
    }
};
