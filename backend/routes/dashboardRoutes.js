const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/admin', verifyToken, requireAdmin, dashboardController.getAdminDashboard);
router.get('/customer', verifyToken, dashboardController.getCustomerDashboard);

module.exports = router;
