const { pool } = require('../config/db');

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
    getPaymentByOrderId,
    simulatePayment
};

