const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Task Endpoints
router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/toggle', taskController.toggleTask);
router.delete('/:id', taskController.deleteTask);

// Batch & Reorder Endpoints
router.post('/batch/update', taskController.batchUpdate);
router.post('/batch/delete', taskController.batchDelete);
router.post('/reorder', taskController.reorderTasks);

// Activity Logs
router.get('/:id/activity', taskController.getActivityLogs);

module.exports = router;
