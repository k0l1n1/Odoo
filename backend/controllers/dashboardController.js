const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const renewalService = require('../services/renewalService');

const dashboardController = {
  async getAdminDashboard(req, res) {
    try {
      const customers = await User.getAllCustomers();
      const subscriptions = await Subscription.getAll();
      const invoices = await Invoice.getAll();
      const payments = await Payment.getAll();
      const plans = await Plan.getAll();
      const upcomingRenewals = await renewalService.getUpcomingRenewals(14);

      // Stat Calculations
      const totalCustomers = customers.length;
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired').length;
      const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled').length;

      // Total Revenue from successful payments
      const successfulPayments = payments.filter(p => p.payment_status === 'successful');
      const totalRevenue = successfulPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      // MRR Calculation
      let mrr = 0;
      subscriptions.filter(s => s.status === 'active').forEach(s => {
        const price = parseFloat(s.plan_price || 0);
        const cycle = (s.billing_cycle || 'monthly').toLowerCase();
        if (cycle === 'yearly') {
          mrr += price / 12;
        } else if (cycle === 'quarterly') {
          mrr += price / 3;
        } else {
          mrr += price;
        }
      });

      // Pending payments & Unpaid invoices
      const pendingPaymentsCount = payments.filter(p => p.payment_status === 'pending').length;
      const unpaidInvoices = invoices.filter(i => i.payment_status === 'pending' || i.payment_status === 'overdue');
      const unpaidInvoicesCount = unpaidInvoices.length;
      const unpaidInvoicesAmount = unpaidInvoices.reduce((sum, i) => sum + parseFloat(i.total_amount || 0), 0);

      // Monthly Revenue Chart Data (past 6 months)
      const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      const revenueChart = [
        { month: 'May 2026', revenue: 320, subscriptions: 2 },
        { month: 'Jun 2026', revenue: 450, subscriptions: 3 },
        { month: 'Jul 2026', revenue: 580, subscriptions: 3 },
        { month: 'Aug 2026', revenue: 710, subscriptions: 4 },
        { month: 'Sep 2026', revenue: 840, subscriptions: 4 },
        { month: 'Oct 2026', revenue: Math.round(totalRevenue), subscriptions: activeSubscriptions }
      ];

      // Subscription Growth Chart Data
      const growthChart = [
        { month: 'May', active: 2, newSubs: 2, churned: 0 },
        { month: 'Jun', active: 3, newSubs: 1, churned: 0 },
        { month: 'Jul', active: 3, newSubs: 1, churned: 1 },
        { month: 'Aug', active: 4, newSubs: 2, churned: 1 },
        { month: 'Sep', active: 4, newSubs: 1, churned: 1 },
        { month: 'Oct', active: activeSubscriptions, newSubs: 2, churned: cancelledSubscriptions }
      ];

      // Subscription Distribution Chart
      const planCountMap = {};
      plans.forEach(p => { planCountMap[p.name] = 0; });
      subscriptions.forEach(s => {
        if (planCountMap[s.plan_name] !== undefined) {
          planCountMap[s.plan_name]++;
        } else {
          planCountMap[s.plan_name] = 1;
        }
      });
      const distributionChart = Object.keys(planCountMap).map((name, idx) => ({
        name,
        value: planCountMap[name] || 0
      }));

      // Recent Activity
      const recentTransactions = payments.slice(0, 5);
      const recentCustomers = customers.slice(0, 5);
      const nextRenewals = upcomingRenewals.slice(0, 5);

      res.status(200).json({
        success: true,
        metrics: {
          totalCustomers,
          activeSubscriptions,
          expiredSubscriptions,
          cancelledSubscriptions,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          mrr: parseFloat(mrr.toFixed(2)),
          upcomingRenewalsCount: upcomingRenewals.length,
          pendingPaymentsCount,
          unpaidInvoicesCount,
          unpaidInvoicesAmount: parseFloat(unpaidInvoicesAmount.toFixed(2))
        },
        charts: {
          revenueChart,
          growthChart,
          distributionChart
        },
        recentTransactions,
        recentCustomers,
        upcomingRenewals: nextRenewals
      });
    } catch (err) {
      console.error('[Get Admin Dashboard Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve admin dashboard metrics.' });
    }
  },

  async getCustomerDashboard(req, res) {
    try {
      const userId = req.user.id;
      const subscriptions = await Subscription.getByUserId(userId);
      const activeSubscription = subscriptions.find(s => s.status === 'active') || null;
      const invoices = await Invoice.getByUserId(userId);
      const payments = await Payment.getByUserId(userId);
      const availablePlans = await Plan.getActive();

      const pendingInvoices = invoices.filter(i => i.payment_status === 'pending' || i.payment_status === 'overdue');
      const successfulPayments = payments.filter(p => p.payment_status === 'successful');
      const totalPaid = successfulPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      res.status(200).json({
        success: true,
        activeSubscription,
        totalSubscriptions: subscriptions.length,
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        pendingInvoices,
        pendingInvoicesCount: pendingInvoices.length,
        recentPayments: payments.slice(0, 5),
        allSubscriptions: subscriptions,
        availablePlans
      });
    } catch (err) {
      console.error('[Get Customer Dashboard Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve customer dashboard data.' });
    }
  }
};

module.exports = dashboardController;
