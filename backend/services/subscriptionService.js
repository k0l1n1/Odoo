const db = require('../config/db');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Invoice = require('../models/Invoice');
const invoiceService = require('./invoiceService');
const { generateSubCode, calculateBillingDates, formatDate } = require('../utils/helpers');

const subscriptionService = {
  async subscribe({ userId, planId, autoRenew = true }) {
    // 1. Check if user already has an active or pending subscription
    const existing = await Subscription.getActiveOrPendingByUserId(userId);
    if (existing) {
      const planName = existing.plan_name || 'Active';
      if (existing.status === 'active') {
        throw new Error(`You already have an active subscription (${planName}). Please cancel or change it before subscribing to a new plan.`);
      } else {
        // Clean up previous unpaid pending subscription so user can subscribe to new plan
        await Subscription.cancel(existing.id, 'Superseded by new subscription attempt');
        const [oldInvs] = await db.query(
          'SELECT id FROM invoices WHERE subscription_id = ?',
          [existing.id]
        );
        for (const oi of (oldInvs || [])) {
          await Invoice.updatePaymentStatus(oi.id, 'failed');
        }
      }
    }

    // 2. Fetch plan details
    const plan = await Plan.getById(planId);
    if (!plan) {
      throw new Error('Selected subscription plan not found.');
    }
    if (plan.status !== 'active') {
      throw new Error('This subscription plan is currently unavailable.');
    }

    // 3. Compute billing dates
    const today = new Date();
    const { startDate, nextBillingDate, expiryDate } = calculateBillingDates(today, plan.billing_cycle);
    const subscriptionCode = generateSubCode();

    // 4. Create subscription (initially pending until invoice payment)
    const subscriptionId = await Subscription.create({
      subscription_code: subscriptionCode,
      user_id: userId,
      plan_id: planId,
      status: 'pending',
      start_date: startDate,
      next_billing_date: nextBillingDate,
      expiry_date: expiryDate,
      auto_renew: autoRenew ? 1 : 0
    });

    // 5. Generate initial invoice with plan discount applied
    const effectivePrice = plan.discount_percentage > 0
      ? (plan.discounted_price || Math.round(plan.price * (1 - plan.discount_percentage / 100) * 100) / 100)
      : plan.price;

    const invoice = await invoiceService.createInvoiceForSubscription({
      subscriptionId,
      userId,
      planName: plan.discount_percentage > 0 ? `${plan.name} (${plan.discount_percentage}% OFF)` : plan.name,
      amount: effectivePrice,
      invoiceType: 'subscription_new',
      daysDue: 7
    });

    let subscription = await Subscription.getById(subscriptionId);
    if (!subscription) {
      subscription = {
        id: subscriptionId,
        subscription_code: subscriptionCode,
        user_id: userId,
        plan_id: planId,
        plan_name: plan.name,
        plan_price: plan.price,
        billing_cycle: plan.billing_cycle,
        status: 'pending',
        start_date: startDate,
        next_billing_date: nextBillingDate,
        expiry_date: expiryDate,
        auto_renew: autoRenew ? 1 : 0,
        features: plan.features || []
      };
    }

    return { subscription, invoice };
  },

  async cancel({ userId, subscriptionId, reason = 'Cancelled by customer', isAdmin = false }) {
    const sub = await Subscription.getById(subscriptionId);
    if (!sub) {
      throw new Error('Subscription not found.');
    }

    if (!isAdmin && sub.user_id !== userId) {
      throw new Error('Unauthorized to cancel this subscription.');
    }

    if (sub.status === 'cancelled') {
      throw new Error('Subscription is already cancelled.');
    }

    await Subscription.cancel(subscriptionId, reason);

    // Cancel all pending invoices for this subscription so they cannot be paid later
    try {
      const [pendingInvs] = await db.query(
        'SELECT id FROM invoices WHERE subscription_id = ?',
        [subscriptionId]
      );
      for (const inv of (pendingInvs || [])) {
        await Invoice.updatePaymentStatus(inv.id, 'failed');
      }
    } catch (invErr) {
      console.warn('[Cancel Subscription] Failed to void pending invoices:', invErr.message);
    }

    return await Subscription.getById(subscriptionId);
  },

  async activateSubscription(subscriptionId) {
    const sub = await Subscription.getById(subscriptionId);
    if (!sub) throw new Error('Subscription not found.');
    await Subscription.updateStatus(subscriptionId, 'active');
    return await Subscription.getById(subscriptionId);
  }
};

module.exports = subscriptionService;
