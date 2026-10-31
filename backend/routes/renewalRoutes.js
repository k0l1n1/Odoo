const express = require('express');
const router = express.Router();
const renewalController = require('../controllers/renewalController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/upcoming', verifyToken, requireAdmin, renewalController.getUpcomingRenewals);
router.get('/history', verifyToken, requireAdmin, renewalController.getRenewalHistory);
router.post('/trigger-check', verifyToken, requireAdmin, renewalController.triggerManualCheck);

module.exports = router;
