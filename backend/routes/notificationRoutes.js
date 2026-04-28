const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

router.post('/subscribe', auth.protect, notificationController.subscribe);

module.exports = router;
