const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// All staff management routes require administrator privileges
router.get('/', verifyToken, requireAdmin, staffController.getAllStaff);
router.post('/', verifyToken, requireAdmin, staffController.createStaff);
router.delete('/:id', verifyToken, requireAdmin, staffController.removeStaff);

module.exports = router;
