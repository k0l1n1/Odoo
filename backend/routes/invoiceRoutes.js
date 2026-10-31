const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/my', verifyToken, invoiceController.getCustomerInvoices);
router.get('/', verifyToken, requireAdmin, invoiceController.getAllInvoices);
router.get('/:id', verifyToken, invoiceController.getInvoiceById);
router.patch('/:id/status', verifyToken, requireAdmin, invoiceController.updateInvoiceStatus);

module.exports = router;
