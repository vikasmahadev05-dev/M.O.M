const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

/**
 * Helper to log activity
 */
const logActivity = async (user, task, actionType, changes = {}) => {
  try {
    await ActivityLog.create({ user, task, actionType, changes });
  } catch (error) {
    console.error('Activity Log Error:', error);
  }
};

/**
 * Get all tasks for the authenticated user
 */
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new task
 */
exports.createTask = async (req, res) => {
  try {
    const newTask = new Task({
      ...req.body,
      user: req.user.id
    });
    
    const savedTask = await newTask.save();
    await logActivity(req.user.id, savedTask._id, 'created');
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a task (includes toggle, subtasks, etc.)
 */
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const wasPending = task.status === 'pending';
    const isNowCompleted = req.body.status === 'completed';
    const oldData = { status: task.status, priority: task.priority, category: task.category };

    Object.assign(task, req.body);
    
    if (wasPending && isNowCompleted && task.recurrence !== 'none') {
      await handleRecurrence(task);
    }

    const updatedTask = await task.save();
    await logActivity(req.user.id, task._id, 'edited', { from: oldData, to: req.body });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Toggle task completion status
 */
exports.toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const isCompleting = task.status !== 'completed';
    task.status = isCompleting ? 'completed' : 'pending';
    
    if (isCompleting && task.recurrence !== 'none') {
      await handleRecurrence(task);
    }

    await task.save();
    await logActivity(req.user.id, task._id, isCompleting ? 'completed' : 'uncompleted');
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Batch Update Tasks
 */
exports.batchUpdate = async (req, res) => {
  const { ids, updates } = req.body;
  try {
    await Task.updateMany(
      { _id: { $in: ids }, user: req.user.id },
      { $set: updates }
    );
    const updatedTasks = await Task.find({ _id: { $in: ids }, user: req.user.id });
    res.json(updatedTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Batch Delete Tasks
 */
exports.batchDelete = async (req, res) => {
  const { ids } = req.body;
  try {
    await Task.deleteMany({ _id: { $in: ids }, user: req.user.id });
    res.json({ message: 'Tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reorder Tasks
 */
exports.reorderTasks = async (req, res) => {
  const { orders } = req.body; // Array of { id, order }
  try {
    const operations = orders.map(item => ({
      updateOne: {
        filter: { _id: item.id, user: req.user.id },
        update: { $set: { order: item.order } }
      }
    }));
    await Task.bulkWrite(operations);
    res.json({ message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Activity Logs for a task
 */
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ task: req.params.id, user: req.user.id }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a task
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await logActivity(req.user.id, req.params.id, 'deleted');
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Helper to handle recurring tasks
 */
async function handleRecurrence(task) {
  const nextDate = new Date(task.dueDate || Date.now());
  
  if (task.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
  else if (task.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
  else if (task.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

  const nextTask = new Task({
    user: task.user,
    title: task.title,
    description: task.description,
    priority: task.priority,
    category: task.category,
    tags: task.tags,
    subtasks: task.subtasks.map(s => ({ title: s.title, isCompleted: false })),
    dueDate: nextDate,
    recurrence: task.recurrence,
    color: task.color,
    order: (task.order || 0) + 1
  });

  await nextTask.save();
}
