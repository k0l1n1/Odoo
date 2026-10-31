const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const RenewalHistory = require('../models/RenewalHistory');
const invoiceService = require('./invoiceService');
const { formatDate } = require('../utils/helpers');

const renewalService = {
  async getUpcomingRenewals(thresholdDays = 7) {
    const allSubs = await Subscription.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];

    for (const sub of allSubs) {
      if (sub.status !== 'active') continue;

      const nextDate = new Date(sub.next_billing_date);
      nextDate.setHours(0, 0, 0, 0);

      const diffTime = nextDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Approaching renewal if within thresholdDays (e.g. 0 to 7 days, or overdue by 1-2 days)
      if (diffDays >= -2 && diffDays <= thresholdDays) {
        // Check if there is an existing pending invoice
        const invoices = await Invoice.getByUserId(sub.user_id);
        const pendingRenewalInv = invoices.find(i => 
          i.subscription_id === sub.id && 
          i.invoice_type === 'subscription_renewal' && 
          (i.payment_status === 'pending' || i.payment_status === 'overdue')
        );

        upcoming.push({
          ...sub,
          days_until_renewal: diffDays,
          has_pending_invoice: !!pendingRenewalInv,
          pending_invoice_id: pendingRenewalInv ? pendingRenewalInv.id : null,
          pending_invoice_number: pendingRenewalInv ? pendingRenewalInv.invoice_number : null
        });
      }
    }

    return upcoming.sort((a, b) => a.days_until_renewal - b.days_until_renewal);
  },

  async checkAndProcessRenewals(thresholdDays = 7) {
    const allSubs = await Subscription.getAll();
    const todayStr = formatDate(new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let invoicesGenerated = 0;
    let expiredCount = 0;
    const actionsTaken = [];

    for (const sub of allSubs) {
      const nextDate = new Date(sub.next_billing_date);
      nextDate.setHours(0, 0, 0, 0);

      const diffTime = nextDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 1. Automatic Renewal Invoice Generation
      if (sub.status === 'active' && sub.auto_renew && diffDays >= 0 && diffDays <= thresholdDays) {
        // Check if renewal invoice already generated for this period
        const userInvoices = await Invoice.getByUserId(sub.user_id);
        const existingInvoice = userInvoices.find(inv => 
          inv.subscription_id === sub.id && 
          inv.invoice_type === 'subscription_renewal' &&
          inv.due_date >= todayStr
        );

        if (!existingInvoice) {
          const newInvoice = await invoiceService.createInvoiceForSubscription({
            subscriptionId: sub.id,
            userId: sub.user_id,
            planName: sub.plan_name,
            amount: sub.plan_price,
            invoiceType: 'subscription_renewal',
            daysDue: Math.max(diffDays, 3)
          });

          await RenewalHistory.create({
            subscription_id: sub.id,
            invoice_id: newInvoice.id,
            previous_billing_date: sub.next_billing_date,
            new_billing_date: sub.next_billing_date,
            renewal_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            renewal_status: 'scheduled',
            notes: `Auto-generated renewal invoice ${newInvoice.invoice_number} due on ${newInvoice.due_date}`
          });

          invoicesGenerated++;
          actionsTaken.push(`Generated renewal invoice ${newInvoice.invoice_number} for customer ${sub.customer_name} (${sub.subscription_code})`);
        }
      }

      // 2. Mark Subscriptions Expired if Past Due Date without payment
      if (sub.status === 'active' && diffDays < -3) {
        // 3 days grace period exceeded
        await Subscription.updateStatus(sub.id, 'expired');
        expiredCount++;
        actionsTaken.push(`Subscription ${sub.subscription_code} marked as expired due to unpaid renewal.`);
      }
    }

    return {
      timestamp: new Date().toISOString(),
      checkedCount: allSubs.length,
      invoicesGenerated,
      expiredCount,
      actionsTaken
    };
  }
};

module.exports = renewalService;
