const Subscription = require('../models/Subscription');
const subscriptionService = require('../services/subscriptionService');

const subscriptionController = {
  async getAllSubscriptions(req, res) {
    try {
      const subscriptions = await Subscription.getAll();
      res.status(200).json({ success: true, count: subscriptions.length, subscriptions });
    } catch (err) {
      console.error('[Get All Subscriptions Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve subscriptions.' });
    }
  },

  async getCustomerSubscriptions(req, res) {
    try {
      const subscriptions = await Subscription.getByUserId(req.user.id);
      res.status(200).json({ success: true, count: subscriptions.length, subscriptions });
    } catch (err) {
      console.error('[Get Customer Subscriptions Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve your subscriptions.' });
    }
  },

  async getSubscriptionById(req, res) {
    try {
      const subscription = await Subscription.getById(req.params.id);
      if (!subscription) {
        return res.status(404).json({ success: false, message: 'Subscription not found.' });
      }

      // Check ownership if not admin
      if (req.user.role !== 'admin' && subscription.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this subscription.' });
      }

      res.status(200).json({ success: true, subscription });
    } catch (err) {
      console.error('[Get Subscription By ID Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve subscription details.' });
    }
  },

  async subscribe(req, res) {
    try {
      const { plan_id, auto_renew } = req.body;

      if (!plan_id) {
        return res.status(400).json({ success: false, message: 'Please select a subscription plan.' });
      }

      const result = await subscriptionService.subscribe({
        userId: req.user.id,
        planId: Number(plan_id),
        autoRenew: auto_renew !== false
      });

      res.status(201).json({
        success: true,
        message: 'Subscription created! Please complete invoice payment to activate.',
        subscription: result.subscription,
        invoice: result.invoice
      });
    } catch (err) {
      console.error('[Subscribe Error]', err);
      res.status(400).json({ success: false, message: err.message || 'Failed to process subscription request.' });
    }
  },

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const isAdmin = req.user.role === 'admin';

      const updatedSub = await subscriptionService.cancel({
        userId: req.user.id,
        subscriptionId: Number(id),
        reason: reason || 'Cancelled by user',
        isAdmin
      });

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully.',
        subscription: updatedSub
      });
    } catch (err) {
      console.error('[Cancel Subscription Error]', err);
      res.status(400).json({ success: false, message: err.message || 'Failed to cancel subscription.' });
    }
  }
};

module.exports = subscriptionController;
