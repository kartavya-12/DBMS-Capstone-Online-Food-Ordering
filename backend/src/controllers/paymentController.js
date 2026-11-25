const crypto = require('crypto');
const Razorpay = require('razorpay');
const { pool } = require('../config/db');

/**
 * Get Razorpay public key ID
 * GET /api/payments/razorpay/key
 */
const getRazorpayKey = async (req, res) => {
    return res.json({
        success: true,
        key_id: process.env.RAZORPAY_KEY_ID || ''
    });
};

/**
 * Create a Razorpay Order
 * POST /api/payments/razorpay/order
 */
const createRazorpayOrder = async (req, res, next) => {
    try {
        const { amount, receipt } = req.body;

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid numeric payment amount greater than zero is required.'
            });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Razorpay credentials are not configured on the server.'
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Razorpay accepts amount in the smallest currency sub-unit (paise for INR)
        const amountInPaise = Math.round(Number(amount) * 100);

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: receipt || `rcpt_${Date.now()}_${req.user.user_id}`
        };

        const order = await razorpay.orders.create(options);

        return res.json({
            success: true,
            key_id: process.env.RAZORPAY_KEY_ID,
            order
        });
    } catch (error) {
        console.error('Razorpay Order Creation Error:', error);
        next(error);
    }
};

/**
 * Verify Razorpay Payment Signature
 * POST /api/payments/razorpay/verify
 */
const verifyRazorpayPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing required Razorpay payment verification details.'
            });
        }

        // Generate expected signature using HMAC SHA256
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed: Invalid transaction signature.'
            });
        }

        // If an existing order_id was provided, update the payment record
        if (order_id) {
            await pool.execute(
                `UPDATE payments 
                 SET payment_status = 'COMPLETED',
                     transaction_reference = ?,
                     notes = CONCAT(COALESCE(notes, ''), ' [Razorpay Verified ID: ', ?, ' at ', NOW(), ']')
                 WHERE order_id = ?`,
                [razorpay_payment_id, razorpay_payment_id, order_id]
            );
        }

        return res.json({
            success: true,
            message: 'Razorpay payment successfully verified.',
            payment_id: razorpay_payment_id
        });
    } catch (error) {
        console.error('Razorpay Signature Verification Error:', error);
        next(error);
    }
};

/**
 * Get payment details for an order
 * GET /api/payments/order/:orderId
 */
const getPaymentByOrderId = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        const [orders] = await pool.execute('SELECT user_id FROM orders WHERE order_id = ?', [orderId]);
        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        // Ownership check
        if (req.user.role === 'customer' && orders[0].user_id !== req.user.user_id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You cannot view payment details for another user.'
            });
        }

        const [payments] = await pool.execute(
            `SELECT payment_id, order_id, transaction_reference, payment_method, payment_status, amount, payment_date, notes
             FROM payments
             WHERE order_id = ?`,
            [orderId]
        );

        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No payment record found for this order.'
            });
        }

        return res.json({
            success: true,
            data: payments[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Process Demo / Simulated Online Payment
 * POST /api/payments/simulate
 */
const simulatePayment = async (req, res, next) => {
    try {
        const { order_id, status } = req.body;

        if (!order_id || !status) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and payment status are required.'
            });
        }

        const allowed = ['COMPLETED', 'FAILED'];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status. Must be COMPLETED or FAILED.'
            });
        }

        const [orders] = await pool.execute('SELECT user_id, order_status FROM orders WHERE order_id = ?', [order_id]);
        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        if (req.user.role === 'customer' && orders[0].user_id !== req.user.user_id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Unauthorized to process payment for this order.'
            });
        }

        await pool.execute(
            `UPDATE payments 
             SET payment_status = ?, notes = CONCAT(COALESCE(notes, ''), ' [Demo Gateway: ', ?, ' at ', NOW(), ']')
             WHERE order_id = ?`,
            [status, status, order_id]
        );

        return res.json({
            success: true,
            message: `Simulated payment marked as ${status}.`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRazorpayKey,
    createRazorpayOrder,
    verifyRazorpayPayment,
    getPaymentByOrderId,
    simulatePayment
};
