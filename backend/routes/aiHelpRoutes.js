const express = require('express');
const router = express.Router();
const aiHelpController = require('../controllers/aiHelpController');
const { verifyToken } = require('../middleware/authMiddleware');

// Endpoint can be accessed by authenticated users (Admin, Staff, Customer)
router.post('/help', verifyToken, aiHelpController.askHelp);

module.exports = router;
