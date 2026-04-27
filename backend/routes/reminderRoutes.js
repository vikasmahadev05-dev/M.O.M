const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth.protect, reminderController.createReminder);
router.get('/pending', auth.protect, reminderController.getPendingReminders);
router.get('/event/:eventId', auth.protect, reminderController.getRemindersByEvent);
router.delete('/:id', auth.protect, reminderController.deleteReminder);
router.post('/:id/snooze', auth.protect, reminderController.snoozeReminder);
router.post('/:id/dismiss', auth.protect, reminderController.dismissReminder);

// Public trigger (webhook for QStash)
router.post('/trigger/:id', reminderController.triggerReminder);

module.exports = router;
