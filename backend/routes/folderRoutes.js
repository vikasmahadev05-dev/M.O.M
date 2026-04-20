const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const Note = require('../models/Note');

// Get all folders
router.get('/', async (req, res) => {
  try {
    const folders = await Folder.find().sort({ createdAt: 1 });
    // Aggregation could be used here to count notes per folder, but fetching separately is simpler for now
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a folder
router.post('/', async (req, res) => {
  const folder = new Folder({
    name: req.body.name || 'New Folder'
  });

  try {
    const newFolder = await folder.save();
    res.status(201).json(newFolder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a folder (rename)
router.put('/:id', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    if (req.body.name !== undefined) folder.name = req.body.name;

    const updatedFolder = await folder.save();
    res.json(updatedFolder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a folder AND all notes inside it
router.delete('/:id', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Cascading delete: Remove all notes associated with this folder
    await Note.deleteMany({ folderId: folder._id });
    
    await folder.deleteOne();
    res.json({ message: 'Folder and its notes deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
