const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Get all notes, sorted by pinned (pinned first) and then by updated date
router.get('/', async (req, res) => {
  try {
    const { search, tag, folderId } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag; // Matches if the tags array contains exactly this tag string
    }

    if (folderId) {
      query.folderId = folderId;
    }

    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new note
router.post('/', async (req, res) => {
  const note = new Note({
    title: req.body.title || 'Untitled Note',
    content: req.body.content || '',
    isPinned: req.body.isPinned || false,
    tags: req.body.tags || [],
    folderId: req.body.folderId || null,
    color: req.body.color
  });

  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (req.body.title !== undefined) note.title = req.body.title;
    if (req.body.content !== undefined) note.content = req.body.content;
    if (req.body.isPinned !== undefined) note.isPinned = req.body.isPinned;
    if (req.body.tags !== undefined) note.tags = req.body.tags;
    if (req.body.folderId !== undefined) note.folderId = req.body.folderId;
    if (req.body.color !== undefined) note.color = req.body.color;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
