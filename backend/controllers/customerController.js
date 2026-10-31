const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

const customerController = {
  async getAllCustomers(req, res) {
    try {
      const customers = await User.getAllCustomers();
      const allSubs = await Subscription.getAll();
      const allInvoices = await Invoice.getAll();
      const allPayments = await Payment.getAll();

      // Aggregate data per customer
      const enrichedCustomers = customers.map(cust => {
        const subs = allSubs.filter(s => s.user_id === cust.id);
        const activeSub = subs.find(s => s.status === 'active');
        const invoices = allInvoices.filter(i => i.user_id === cust.id);
        const payments = allPayments.filter(p => p.user_id === cust.id && p.payment_status === 'successful');
        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        return {
          ...cust,
          active_plan: activeSub ? activeSub.plan_name : 'None',
          subscription_status: activeSub ? 'Active' : (subs.length > 0 ? subs[0].status : 'No Subscriptions'),
          total_subscriptions: subs.length,
          total_invoices: invoices.length,
          total_paid: parseFloat(totalPaid.toFixed(2))
        };
      });

      res.status(200).json({ success: true, count: enrichedCustomers.length, customers: enrichedCustomers });
    } catch (err) {
      console.error('[Get All Customers Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
    }
  },

  async getCustomerById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user || user.role !== 'customer') {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      const subscriptions = await Subscription.getByUserId(user.id);
      const invoices = await Invoice.getByUserId(user.id);
      const payments = await Payment.getByUserId(user.id);

      res.status(200).json({
        success: true,
        customer: user,
        subscriptions,
        invoices,
        payments
      });
    } catch (err) {
      console.error('[Get Customer By ID Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve customer details.' });
    }
  },

  async toggleCustomerStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be 'active' or 'inactive'." });
      }

      const customer = await User.findById(id);
      if (!customer || customer.role !== 'customer') {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      await User.updateStatus(id, status);
      const updated = await User.findById(id);

      res.status(200).json({
        success: true,
        message: `Customer account ${status === 'active' ? 'activated' : 'deactivated'}.`,
        customer: updated
      });
    } catch (err) {
      console.error('[Toggle Customer Status Error]', err);
      res.status(500).json({ success: false, message: 'Failed to update customer status.' });
    }
  }
};

module.exports = customerController;
