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
    name: req.body.name || 'New Folder',
    parentId: req.body.parentId || null
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
    if (req.body.parentId !== undefined) folder.parentId = req.body.parentId;

    const updatedFolder = await folder.save();
    res.json(updatedFolder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Recursive function to delete folder and its contents
const deleteFolderRecursive = async (folderId) => {
  // Find all subfolders
  const subfolders = await Folder.find({ parentId: folderId });
  
  // Delete each subfolder recursively
  for (const sub of subfolders) {
    await deleteFolderRecursive(sub._id);
  }

  // Delete all notes in THIS folder
  await Note.deleteMany({ folderId: folderId });
  
  // Delete the folder itself
  await Folder.findByIdAndDelete(folderId);
};

// Delete a folder AND all nested content
router.delete('/:id', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    await deleteFolderRecursive(req.params.id);
    res.json({ message: 'Folder, subfolders, and all contained notes deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
