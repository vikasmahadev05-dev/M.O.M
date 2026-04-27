const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

// Apply protection to all note routes
router.use(protect);


// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images and documents are allowed'));
  }
});

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

    // Always filter by current user
    query.userId = req.user._id;

    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new note
router.post('/', async (req, res) => {
  const note = new Note({
    userId: req.user._id,
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
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (req.body.title !== undefined) note.title = req.body.title;
    if (req.body.content !== undefined) note.content = req.body.content;
    if (req.body.isPinned !== undefined) note.isPinned = req.body.isPinned;
    if (req.body.tags !== undefined) note.tags = req.body.tags;
    if (req.body.folderId !== undefined) note.folderId = req.body.folderId;
    if (req.body.color !== undefined) note.color = req.body.color;
    if (req.body.links !== undefined) note.links = req.body.links;
    if (req.body.fx !== undefined) note.fx = req.body.fx;
    if (req.body.fy !== undefined) note.fy = req.body.fy;

    // Automatic Link Parsing
    if (req.body.content !== undefined) {
      // Find all [[Title]] occurrences
      const wikiLinkRegex = /\[\[(.*?)\]\]/g;
      const matches = [...req.body.content.matchAll(wikiLinkRegex)];
      const titles = matches.map(m => m[1]);

      if (titles.length > 0) {
        // Find notes matching these titles
        const foundNotes = await Note.find({ title: { $in: titles } });
        const targetIds = foundNotes.map(n => n._id);

        // Add bidirectional links
        for (const targetId of targetIds) {
          // Check if already linked (handling both old ID style and new object style)
          const isLinked = note.links.some(l => 
            (l.targetId?.toString() === targetId.toString()) || (l.toString() === targetId.toString())
          );

          if (!isLinked) {
            note.links.push({ targetId, reason: 'Auto-linked' });
          }
          
          // Add backlink to the target note
          await Note.findByIdAndUpdate(targetId, { 
            $addToSet: { links: { targetId: note._id, reason: 'Auto-linked' } } 
          });
        }
      }
    }

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint to fetch bidirectional links (outgoing and incoming/backlinks)
router.get('/:id/linked', async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findOne({ _id: noteId, userId: req.user._id })
      .populate('links.targetId', 'title content color tags priority')
      .lean();

      
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // 1. Format Outgoing Links
    const outgoing = (note.links || [])
      .filter(l => l.targetId) // Filter out deleted notes
      .map(l => ({
        ...l.targetId,
        _id: l.targetId._id.toString(), // Ensure IDs are strings for React keys
        reason: l.reason || ''
      }));

    // 2. Fetch Backlinks (Incoming)
    const backlinksRaw = await Note.find({ 'links.targetId': noteId }, 'title content color tags priority links').lean();
    
    const backlinks = backlinksRaw.map(b => {
      const linkDetail = (b.links || []).find(l => l.targetId?.toString() === noteId);
      return {
        ...b,
        _id: b._id.toString(),
        reason: linkDetail?.reason || ''
      };
    });

    res.json({
      outgoing,
      backlinks
    });
  } catch (error) {
    console.error('Linked fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Link two notes bidirectionally
router.post('/link', async (req, res) => {
  const { noteId, targetId, reason = '' } = req.body;
  try {
    const [noteA, noteB] = await Promise.all([
      Note.findById(noteId),
      Note.findById(targetId)
    ]);

    if (!noteA || !noteB) return res.status(404).json({ message: 'One or both notes not found' });

    // Add B to A if not already there
    const isAlreadyInA = noteA.links.some(l => 
      (l.targetId?.toString() === targetId.toString()) || (l.toString() === targetId)
    );
    if (!isAlreadyInA) {
      noteA.links.push({ targetId, reason });
      await noteA.save();
    }

    // Add A to B if not already there (Bidirectional)
    const isAlreadyInB = noteB.links.some(l => 
      (l.targetId?.toString() === noteId.toString()) || (l.toString() === noteId)
    );
    if (!isAlreadyInB) {
      noteB.links.push({ targetId: noteId, reason });
      await noteB.save();
    }

    res.json({ message: 'Notes linked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unlink two notes bidirectionally
router.post('/unlink', async (req, res) => {
  const { noteId, targetId } = req.body;
  try {
    const [noteA, noteB] = await Promise.all([
      Note.findById(noteId),
      Note.findById(targetId)
    ]);

    if (noteA) {
      noteA.links = noteA.links.filter(l => {
        const id = l.targetId ? l.targetId.toString() : l.toString();
        return id !== targetId;
      });
      await noteA.save();
    }

    if (noteB) {
      noteB.links = noteB.links.filter(l => {
        const id = l.targetId ? l.targetId.toString() : l.toString();
        return id !== noteId;
      });
      await noteB.save();
    }

    res.json({ message: 'Notes unlinked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get data for the Knowledge Graph
router.get('/graph/data', async (req, res) => {
  try {
    const notes = await Note.find({}, 'title links color tags priority fx fy').lean();
    
    const nodes = notes.map(n => ({
      id: n._id.toString(), // Ensure ID is a clean string
      title: n.title,
      color: n.color,
      tags: n.tags,
      priority: n.priority,
      fx: n.fx,
      fy: n.fy
    }));

    const nodeIds = new Set(nodes.map(n => n.id.toString()));
    const edges = [];
    const seen = new Set();

    notes.forEach(note => {
      note.links.forEach(link => {
        const sourceId = note._id.toString();
        const targetId = link.targetId ? link.targetId.toString() : link.toString();
        const reason = link.reason || '';
        
        // GHOST FILTER: Only add edge if BOTH nodes exist in the current set
        if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) return;

        // Only add one edge for bidirectional links to keep the graph clean
        const edgeId = [sourceId, targetId].sort().join('-');
        if (!seen.has(edgeId)) {
          edges.push({
            source: sourceId,
            target: targetId,
            reason: reason 
          });
          seen.add(edgeId);
        }
      });
    });

    res.json({ nodes, edges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all pinned positions (Magic Shuffle backend reset)
router.post('/graph/clear-pins', async (req, res) => {
  try {
    await Note.updateMany({}, { $set: { fx: null, fy: null } });
    res.json({ message: 'All pins cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) return res.status(404).json({ message: 'Note not found' });

    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// File Upload Endpoint (Returns metadata)
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    // Create relative URL (Frontend will prepend API base URL)
    const fileUrl = `uploads/${req.file.filename}`;
    
    res.json({
      url: fileUrl,
      name: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Attach metadata to a note
router.post('/:id/attach', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });


    note.attachments.push(req.body); // Body: { url, name, fileType, size }
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove attachment from note and disk
router.delete('/:id/attachments/:attachmentId', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });


    const attachment = note.attachments.id(req.params.attachmentId);
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    // Delete physical file
    const fileName = attachment.url.split('/').pop();
    const filePath = path.join('uploads', fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from DB
    note.attachments.pull(req.params.attachmentId);
    await note.save();
    
    res.json({ message: 'Attachment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
