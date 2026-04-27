const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleController');
const auth = require('../middleware/authMiddleware');

router.get('/connect-url', auth.protect, googleController.getConnectUrl);
router.get('/callback', googleController.callback);
router.get('/status', auth.protect, googleController.getStatus);
router.get('/events', auth.protect, googleController.fetchGoogleEvents);
router.post('/toggle-sync', auth.protect, googleController.toggleSync);
router.post('/disconnect', auth.protect, googleController.disconnect);

module.exports = router;
