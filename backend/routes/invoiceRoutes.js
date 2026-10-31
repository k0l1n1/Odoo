const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { verifyToken, requireStaffOrAdmin } = require('../middleware/authMiddleware');

router.get('/my', verifyToken, invoiceController.getCustomerInvoices);
router.get('/', verifyToken, requireStaffOrAdmin, invoiceController.getAllInvoices);
router.get('/:id', verifyToken, invoiceController.getInvoiceById);
router.get('/:id/pdf', verifyToken, invoiceController.downloadInvoicePdf);
router.get('/:id/download', verifyToken, invoiceController.downloadInvoicePdf);
router.patch('/:id/status', verifyToken, requireStaffOrAdmin, invoiceController.updateInvoiceStatus);

module.exports = router;
