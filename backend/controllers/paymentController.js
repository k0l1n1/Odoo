const Payment = require('../models/Payment');
const paymentService = require('../services/paymentService');

const paymentController = {
  async getAllPayments(req, res) {
    try {
      const payments = await Payment.getAll();
      const { status, search } = req.query;

      let filtered = payments;
      if (status && status !== 'all') {
        filtered = filtered.filter(p => p.payment_status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.payment_code.toLowerCase().includes(q) ||
          p.transaction_reference.toLowerCase().includes(q) ||
          p.customer_name.toLowerCase().includes(q) ||
          p.customer_email.toLowerCase().includes(q) ||
          p.invoice_number.toLowerCase().includes(q)
        );
      }

      res.status(200).json({ success: true, count: filtered.length, payments: filtered });
    } catch (err) {
      console.error('[Get All Payments Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve payments.' });
    }
  },

  async getCustomerPayments(req, res) {
    try {
      const payments = await Payment.getByUserId(req.user.id);
      res.status(200).json({ success: true, count: payments.length, payments });
    } catch (err) {
      console.error('[Get Customer Payments Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve your payments.' });
    }
  },

  async getPaymentById(req, res) {
    try {
      const payment = await Payment.getById(req.params.id);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment record not found.' });
      }

      if (req.user.role !== 'admin' && payment.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this payment.' });
      }

      res.status(200).json({ success: true, payment });
    } catch (err) {
      console.error('[Get Payment By ID Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve payment details.' });
    }
  },

  async processPayment(req, res) {
    try {
      const { invoice_id, payment_method, simulation_outcome, card_details, upi_details, bank_name } = req.body;

      if (!invoice_id) {
        return res.status(400).json({ success: false, message: 'Invoice ID is required to process payment.' });
      }

      const result = await paymentService.processSimulatedPayment({
        userId: req.user.id,
        invoiceId: Number(invoice_id),
        paymentMethod: payment_method || 'Credit Card',
        simulationOutcome: simulation_outcome || 'successful',
        details: {
          cardNumber: card_details?.number,
          upiId: upi_details?.vpa,
          bankName: bank_name
        }
      });

      res.status(200).json(result);
    } catch (err) {
      console.error('[Process Payment Error]', err);
      res.status(400).json({ success: false, message: err.message || 'Payment simulation failed.' });
    }
  }
};

module.exports = paymentController;
