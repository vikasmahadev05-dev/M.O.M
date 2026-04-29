const express = require('express');
const router = express.Router();
const taskCategoryController = require('../controllers/taskCategoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', taskCategoryController.getCategories);
router.post('/', taskCategoryController.createCategory);
router.put('/:id', taskCategoryController.updateCategory);
router.delete('/:id', taskCategoryController.deleteCategory);

module.exports = router;
