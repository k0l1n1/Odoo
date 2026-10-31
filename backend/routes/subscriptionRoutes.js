const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken, requireStaffOrAdmin } = require('../middleware/authMiddleware');

// Customer endpoints
router.get('/my', verifyToken, subscriptionController.getCustomerSubscriptions);
router.post('/subscribe', verifyToken, subscriptionController.subscribe);
router.post('/:id/cancel', verifyToken, subscriptionController.cancel);

// Operational endpoints
router.get('/', verifyToken, requireStaffOrAdmin, subscriptionController.getAllSubscriptions);
router.get('/:id', verifyToken, subscriptionController.getSubscriptionById);

module.exports = router;
