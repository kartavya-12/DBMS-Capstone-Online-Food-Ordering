const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(authenticate);

// Customer endpoints
router.post('/', authorize('customer', 'admin'), createOrder);
router.get('/my-orders', authorize('customer', 'admin'), getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);

// Admin & Restaurant Manager status updates
router.patch('/:id/status', authorize('admin', 'restaurant_manager'), updateOrderStatus);

module.exports = router;

