const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const Note = require('../models/Note');

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ isDefault: -1, name: 1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new custom tag
router.post('/', async (req, res) => {
  const tagName = req.body.name;
  
  if (!tagName) {
      return res.status(400).json({ message: "Tag name is required" });
  }

  // Ensure it starts with #
  const formattedName = tagName.startsWith('#') ? tagName : `#${tagName}`;

  try {
    // Check if it already exists
    const existingTag = await Tag.findOne({ name: formattedName });
    if (existingTag) {
        return res.status(200).json(existingTag);
    }

    const tag = new Tag({
      name: formattedName,
      isDefault: false
    });

    const newTag = await tag.save();
    res.status(201).json(newTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a custom tag and cascade removal from all notes
router.delete('/:id', async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    
    // Optional precaution: prevent deleting manually seeded default tags
    if (tag.isDefault) {
        return res.status(403).json({ message: "Cannot delete a default system tag." });
    }

    const tagName = tag.name;

    // Cascading effect: Remove this tag from the tags array inside ALL notes leveraging it.
    await Note.updateMany(
        { tags: tagName },
        { $pull: { tags: tagName } }
    );
    
    await tag.deleteOne();
    res.json({ message: 'Tag deleted and removed from all notes.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
