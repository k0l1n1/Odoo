const Invoice = require('../models/Invoice');
const pdfService = require('../services/pdfService');

const invoiceController = {
  async getAllInvoices(req, res) {
    try {
      const invoices = await Invoice.getAll();
      const { status, search } = req.query;

      let filtered = invoices;
      if (status && status !== 'all') {
        filtered = filtered.filter(i => i.payment_status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(i =>
          i.invoice_number.toLowerCase().includes(q) ||
          i.customer_name.toLowerCase().includes(q) ||
          i.customer_email.toLowerCase().includes(q) ||
          i.plan_name.toLowerCase().includes(q)
        );
      }

      res.status(200).json({ success: true, count: filtered.length, invoices: filtered });
    } catch (err) {
      console.error('[Get All Invoices Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve invoices.' });
    }
  },

  async getCustomerInvoices(req, res) {
    try {
      const invoices = await Invoice.getByUserId(req.user.id);
      res.status(200).json({ success: true, count: invoices.length, invoices });
    } catch (err) {
      console.error('[Get Customer Invoices Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve your invoices.' });
    }
  },

  async getInvoiceById(req, res) {
    try {
      const invoice = await Invoice.getById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }

      // Check ownership if not admin
      if (req.user.role !== 'admin' && invoice.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this invoice.' });
      }

      res.status(200).json({ success: true, invoice });
    } catch (err) {
      console.error('[Get Invoice By ID Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve invoice details.' });
    }
  },

  async updateInvoiceStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['paid', 'pending', 'failed', 'overdue'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
      }

      const invoice = await Invoice.getById(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }

      await Invoice.updatePaymentStatus(id, status);
      const updatedInvoice = await Invoice.getById(id);

      res.status(200).json({
        success: true,
        message: `Invoice status updated to ${status}.`,
        invoice: updatedInvoice
      });
    } catch (err) {
      console.error('[Update Invoice Status Error]', err);
      res.status(500).json({ success: false, message: 'Failed to update invoice status.' });
    }
  },

  async downloadInvoicePdf(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.getById(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }

      // Check ownership if customer
      if (req.user.role !== 'admin' && req.user.role !== 'staff' && invoice.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to download this invoice.' });
      }

      const isDownload = req.query.inline !== 'true';
      pdfService.generateInvoicePdf(invoice, res, isDownload);
    } catch (err) {
      console.error('[Download Invoice PDF Error]', err);
      res.status(500).json({ success: false, message: 'Failed to generate invoice PDF.' });
    }
  }
};

module.exports = invoiceController;
