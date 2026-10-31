const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public or authenticated endpoints for browsing
router.get('/', planController.getAllPlans);
router.get('/active', planController.getActivePlans);
router.get('/:id', planController.getPlanById);

// Admin-only endpoints
router.post('/', verifyToken, requireAdmin, planController.createPlan);
router.put('/:id', verifyToken, requireAdmin, planController.updatePlan);
router.patch('/:id/status', verifyToken, requireAdmin, planController.togglePlanStatus);
router.delete('/:id', verifyToken, requireAdmin, planController.deletePlan);

module.exports = router;
