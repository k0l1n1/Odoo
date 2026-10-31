const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken, requireAdmin, requireStaffOrAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireStaffOrAdmin, customerController.getAllCustomers);
router.get('/:id', verifyToken, requireStaffOrAdmin, customerController.getCustomerById);
router.patch('/:id/status', verifyToken, requireAdmin, customerController.toggleCustomerStatus);

module.exports = router;
