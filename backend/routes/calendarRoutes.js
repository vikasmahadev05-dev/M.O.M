const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth.protect, calendarController.fetchItems);
router.post('/', auth.protect, calendarController.createItem);
router.put('/:id', auth.protect, calendarController.updateItem);
router.delete('/:id', auth.protect, calendarController.deleteItem);
router.post('/:id/duplicate', auth.protect, calendarController.duplicateItem);

module.exports = router;
