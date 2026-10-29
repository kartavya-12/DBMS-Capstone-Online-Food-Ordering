const express = require('express');
const router = express.Router();
const {
    getDashboardKPIs,
    getSalesReport,
    getAllUsers,
    toggleUserStatus,
    getAllOrders
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(authenticate);

// Admin-only metrics and reports
router.get('/kpis', authorize('admin'), getDashboardKPIs);
router.get('/reports', authorize('admin'), getSalesReport);
router.get('/users', authorize('admin'), getAllUsers);
router.patch('/users/:id/status', authorize('admin'), toggleUserStatus);

// Order monitor accessible to Admin & Restaurant Managers
router.get('/orders', authorize('admin', 'restaurant_manager'), getAllOrders);

module.exports = router;

