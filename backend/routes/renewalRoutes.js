const express = require('express');
const router = express.Router();
const renewalController = require('../controllers/renewalController');
const { verifyToken, requireStaffOrAdmin } = require('../middleware/authMiddleware');

router.get('/upcoming', verifyToken, requireStaffOrAdmin, renewalController.getUpcomingRenewals);
router.get('/history', verifyToken, requireStaffOrAdmin, renewalController.getRenewalHistory);
router.post('/trigger-check', verifyToken, requireStaffOrAdmin, renewalController.triggerManualCheck);

module.exports = router;
