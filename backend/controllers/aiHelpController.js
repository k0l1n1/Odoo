const aiHelpService = require('../services/aiHelpService');

const aiHelpController = {
  async askHelp(req, res) {
    try {
      const { message, currentPage, history } = req.body;
      const role = req.user ? req.user.role : 'admin';

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, message: 'Message is required.' });
      }

      const result = await aiHelpService.getHelpResponse({
        message,
        currentPage: currentPage || '/admin',
        role,
        history: Array.isArray(history) ? history : []
      });

      res.status(200).json(result);
    } catch (err) {
      console.error('[AI Help Controller Error]', err);
      res.status(500).json({ success: false, message: 'Error processing AI help request.' });
    }
  }
};

module.exports = aiHelpController;
