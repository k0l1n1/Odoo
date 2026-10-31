const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { verifyToken, requireAdmin, requireStaffOrAdmin } = require('../middleware/authMiddleware');

// Public or authenticated endpoints for browsing
router.get('/', planController.getAllPlans);
router.get('/active', planController.getActivePlans);
router.get('/:id', planController.getPlanById);

// Operational & Admin endpoints
router.post('/', verifyToken, requireStaffOrAdmin, planController.createPlan);
router.put('/:id', verifyToken, requireStaffOrAdmin, planController.updatePlan);
router.patch('/:id/status', verifyToken, requireStaffOrAdmin, planController.togglePlanStatus);
router.delete('/:id', verifyToken, requireAdmin, planController.deletePlan);

module.exports = router;
