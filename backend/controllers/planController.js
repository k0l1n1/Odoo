const Plan = require('../models/Plan');

const planController = {
  async getAllPlans(req, res) {
    try {
      const plans = await Plan.getAll();
      res.status(200).json({ success: true, count: plans.length, plans });
    } catch (err) {
      console.error('[Get All Plans Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve plans.' });
    }
  },

  async getActivePlans(req, res) {
    try {
      const plans = await Plan.getActive();
      res.status(200).json({ success: true, count: plans.length, plans });
    } catch (err) {
      console.error('[Get Active Plans Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve active plans.' });
    }
  },

  async getPlanById(req, res) {
    try {
      const plan = await Plan.getById(req.params.id);
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found.' });
      }
      res.status(200).json({ success: true, plan });
    } catch (err) {
      console.error('[Get Plan By ID Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve plan details.' });
    }
  },

  async createPlan(req, res) {
    try {
      const { name, description, price, billing_cycle, features, status } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({ success: false, message: 'Plan name and price are required.' });
      }

      const validCycles = ['monthly', 'quarterly', 'yearly'];
      const cycle = validCycles.includes(billing_cycle) ? billing_cycle : 'monthly';

      const parsedFeatures = Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').filter(f => f.trim()) : []);

      const planId = await Plan.create({
        name: name.trim(),
        description: description ? description.trim() : '',
        price: parseFloat(price),
        billing_cycle: cycle,
        features: parsedFeatures,
        status: status || 'active'
      });

      const newPlan = await Plan.getById(planId);
      res.status(201).json({ success: true, message: 'Subscription plan created successfully!', plan: newPlan });
    } catch (err) {
      console.error('[Create Plan Error]', err);
      res.status(500).json({ success: false, message: 'Failed to create subscription plan.' });
    }
  },

  async updatePlan(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, billing_cycle, features, status } = req.body;

      const existingPlan = await Plan.getById(id);
      if (!existingPlan) {
        return res.status(404).json({ success: false, message: 'Plan not found.' });
      }

      const validCycles = ['monthly', 'quarterly', 'yearly'];
      const cycle = validCycles.includes(billing_cycle) ? billing_cycle : existingPlan.billing_cycle;

      let parsedFeatures = existingPlan.features;
      if (Array.isArray(features)) {
        parsedFeatures = features;
      } else if (typeof features === 'string') {
        parsedFeatures = features.split('\n').map(f => f.trim()).filter(Boolean);
      }

      await Plan.update(id, {
        name: name !== undefined ? name.trim() : existingPlan.name,
        description: description !== undefined ? description.trim() : existingPlan.description,
        price: price !== undefined ? parseFloat(price) : existingPlan.price,
        billing_cycle: cycle,
        features: parsedFeatures,
        status: status || existingPlan.status
      });

      const updatedPlan = await Plan.getById(id);
      res.status(200).json({ success: true, message: 'Subscription plan updated successfully!', plan: updatedPlan });
    } catch (err) {
      console.error('[Update Plan Error]', err);
      res.status(500).json({ success: false, message: 'Failed to update subscription plan.' });
    }
  },

  async togglePlanStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be 'active' or 'inactive'." });
      }

      const existingPlan = await Plan.getById(id);
      if (!existingPlan) {
        return res.status(404).json({ success: false, message: 'Plan not found.' });
      }

      await Plan.toggleStatus(id, status);
      const updatedPlan = await Plan.getById(id);
      res.status(200).json({ success: true, message: `Plan status set to ${status}.`, plan: updatedPlan });
    } catch (err) {
      console.error('[Toggle Plan Status Error]', err);
      res.status(500).json({ success: false, message: 'Failed to update plan status.' });
    }
  },

  async deletePlan(req, res) {
    try {
      const { id } = req.params;
      const existingPlan = await Plan.getById(id);
      if (!existingPlan) {
        return res.status(404).json({ success: false, message: 'Plan not found.' });
      }

      await Plan.delete(id);
      res.status(200).json({ success: true, message: 'Plan deleted successfully.' });
    } catch (err) {
      console.error('[Delete Plan Error]', err);
      if (err.code === '23503' || (err.message && err.message.includes('foreign key constraint'))) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete this plan because active or past customer subscriptions are linked to it. You can deactivate it instead.'
        });
      }
      res.status(500).json({ success: false, message: 'Failed to delete plan: ' + (err.message || 'Server error') });
    }
  }
};

module.exports = planController;
