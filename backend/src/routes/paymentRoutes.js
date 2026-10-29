const express = require('express');
const router = express.Router();
const { getPaymentByOrderId, simulatePayment } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/order/:orderId', getPaymentByOrderId);
router.post('/simulate', simulatePayment);

module.exports = router;

