const Task = require('../models/Task');

/**
 * Get all tasks
 */
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new task
 */
exports.createTask = async (req, res) => {
  const { title, source, priority, category } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const newTask = new Task({
      title,
      source: source || 'note',
      priority: priority || 'Medium',
      category: category || 'Note'
    });
    
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Toggle task completion status
 */
exports.toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a task
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
