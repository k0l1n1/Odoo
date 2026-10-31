const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, requireStaffOrAdmin } = require('../middleware/authMiddleware');

router.get('/admin', verifyToken, requireStaffOrAdmin, dashboardController.getAdminDashboard);
router.get('/customer', verifyToken, dashboardController.getCustomerDashboard);

module.exports = router;
