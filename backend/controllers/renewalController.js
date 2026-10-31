const renewalService = require('../services/renewalService');
const RenewalHistory = require('../models/RenewalHistory');

const renewalController = {
  async getUpcomingRenewals(req, res) {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 7;
      const upcoming = await renewalService.getUpcomingRenewals(days);
      res.status(200).json({ success: true, count: upcoming.length, upcoming });
    } catch (err) {
      console.error('[Get Upcoming Renewals Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve upcoming renewals.' });
    }
  },

  async getRenewalHistory(req, res) {
    try {
      const history = await RenewalHistory.getAll();
      res.status(200).json({ success: true, count: history.length, history });
    } catch (err) {
      console.error('[Get Renewal History Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve renewal history.' });
    }
  },

  async triggerManualCheck(req, res) {
    try {
      const days = req.body.days ? parseInt(req.body.days) : 7;
      const result = await renewalService.checkAndProcessRenewals(days);
      res.status(200).json({
        success: true,
        message: `Renewal check completed! Invoices generated: ${result.invoicesGenerated}, Subscriptions expired: ${result.expiredCount}`,
        result
      });
    } catch (err) {
      console.error('[Trigger Manual Renewal Error]', err);
      res.status(500).json({ success: false, message: 'Failed to run renewal cycle check.' });
    }
  }
};

module.exports = renewalController;
