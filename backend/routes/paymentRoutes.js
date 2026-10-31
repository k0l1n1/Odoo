const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, requireStaffOrAdmin } = require('../middleware/authMiddleware');

router.get('/my', verifyToken, paymentController.getCustomerPayments);
router.post('/process', verifyToken, paymentController.processPayment);
router.get('/', verifyToken, requireStaffOrAdmin, paymentController.getAllPayments);
router.get('/:id', verifyToken, paymentController.getPaymentById);

module.exports = router;
