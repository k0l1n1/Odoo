const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireAdmin, customerController.getAllCustomers);
router.get('/:id', verifyToken, requireAdmin, customerController.getCustomerById);
router.patch('/:id/status', verifyToken, requireAdmin, customerController.toggleCustomerStatus);

module.exports = router;
