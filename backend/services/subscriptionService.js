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
        throw new Error(`You already have a pending subscription (${planName}). Please complete payment or cancel it before subscribing to a new plan.`);
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

    // 5. Generate initial invoice
    const invoice = await invoiceService.createInvoiceForSubscription({
      subscriptionId,
      userId,
      planName: plan.name,
      amount: plan.price,
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
