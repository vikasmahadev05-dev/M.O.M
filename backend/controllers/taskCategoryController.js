const TaskCategory = require('../models/TaskCategory');
const Task = require('../models/Task');

/**
 * Get all categories for a user
 */
exports.getCategories = async (req, res) => {
  try {
    let categories = await TaskCategory.find({ user: req.user.id }).sort({ order: 1 });
    
    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaults = [
        { name: 'Personal', color: '#60a5fa', order: 0, user: req.user.id },
        { name: 'Work', color: '#fb923c', order: 1, user: req.user.id },
        { name: 'Study', color: '#c084fc', order: 2, user: req.user.id },
        { name: 'Finance', color: '#34d399', order: 3, user: req.user.id }
      ];
      categories = await TaskCategory.insertMany(defaults);
    }
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a category
 */
exports.createCategory = async (req, res) => {
  try {
    const category = new TaskCategory({
      ...req.body,
      user: req.user.id
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a category
 */
exports.updateCategory = async (req, res) => {
  try {
    const category = await TaskCategory.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await TaskCategory.findOne({ _id: req.params.id, user: req.user.id });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // Update tasks using this category to 'Uncategorized' or similar
    await Task.updateMany(
      { category: category.name, user: req.user.id },
      { category: 'Personal' }
    );

    await TaskCategory.deleteOne({ _id: req.params.id });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
