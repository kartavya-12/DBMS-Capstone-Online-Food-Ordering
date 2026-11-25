const express = require('express');
const router = express.Router();
const {
    getRazorpayKey,
    createRazorpayOrder,
    verifyRazorpayPayment,
    getPaymentByOrderId,
    simulatePayment
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Razorpay Payment Gateway Routes
router.get('/razorpay/key', getRazorpayKey);
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Order Payment Records & Demo Simulation
router.get('/order/:orderId', getPaymentByOrderId);
router.post('/simulate', simulatePayment);

module.exports = router;
