const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Customer endpoints
router.get('/my', verifyToken, subscriptionController.getCustomerSubscriptions);
router.post('/subscribe', verifyToken, subscriptionController.subscribe);
router.post('/:id/cancel', verifyToken, subscriptionController.cancel);

// Admin endpoints
router.get('/', verifyToken, requireAdmin, subscriptionController.getAllSubscriptions);
router.get('/:id', verifyToken, subscriptionController.getSubscriptionById);

module.exports = router;
