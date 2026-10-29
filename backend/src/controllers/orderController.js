const { pool } = require('../config/db');

// Allowed status lifecycle transitions
const VALID_TRANSITIONS = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['PREPARING', 'CANCELLED'],
    'PREPARING': ['OUT_FOR_DELIVERY', 'CANCELLED'],
    'OUT_FOR_DELIVERY': ['DELIVERED', 'CANCELLED'],
    'DELIVERED': [],
    'CANCELLED': []
};

/**
 * Place a new food delivery order (ACID Transaction)
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        const {
            restaurant_id,
            delivery_address_id,
            items, // Array of { item_id, quantity, notes }
            payment_method,
            special_instructions
        } = req.body;

        // 1. Basic payload validations
        if (!restaurant_id || !delivery_address_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant ID, delivery address, and at least one item are required.'
            });
        }

        const validMethods = ['CASH_ON_DELIVERY', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET'];
        const selectedMethod = payment_method || 'CASH_ON_DELIVERY';
        if (!validMethods.includes(selectedMethod)) {
            return res.status(400).json({
                success: false,
                message: `Invalid payment method. Allowed: ${validMethods.join(', ')}`
            });
        }

        // 2. Fetch and validate delivery address
        const [addresses] = await connection.execute(
            'SELECT address_id, address_line1, address_line2, city, state, postal_code, landmark FROM user_addresses WHERE address_id = ? AND user_id = ?',
            [delivery_address_id, req.user.user_id]
        );

        if (addresses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Selected delivery address does not exist or does not belong to you.'
            });
        }

        const addr = addresses[0];
        // Create permanent address snapshot text
        const addressSnapshot = `${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}, ${addr.city}, ${addr.state} - ${addr.postal_code}${addr.landmark ? ' (Landmark: ' + addr.landmark + ')' : ''}`;

        // 3. Fetch restaurant details
        const [restaurants] = await connection.execute(
            'SELECT restaurant_id, name, is_active FROM restaurants WHERE restaurant_id = ?',
            [restaurant_id]
        );

        if (restaurants.length === 0 || !restaurants[0].is_active) {
            return res.status(400).json({
                success: false,
                message: 'The selected restaurant is currently closed or inactive.'
            });
        }

        // 4. Validate menu items and compute server-authoritative totals
        const itemIds = items.map(i => parseInt(i.item_id, 10));
        // Build placeholders (?, ?, ?)
        const placeholders = itemIds.map(() => '?').join(',');
        const [dbMenuItems] = await connection.query(
            `SELECT item_id, restaurant_id, name, price, is_available 
             FROM menu_items 
             WHERE item_id IN (${placeholders})`,
            itemIds
        );

        const dbItemMap = new Map();
        dbMenuItems.forEach(item => dbItemMap.set(item.item_id, item));

        let subtotal = 0;
        const verifiedOrderItems = [];

        for (const reqItem of items) {
            const dbItem = dbItemMap.get(parseInt(reqItem.item_id, 10));

            if (!dbItem) {
                return res.status(400).json({
                    success: false,
                    message: `Item with ID ${reqItem.item_id} does not exist.`
                });
            }

            // Single Restaurant Invariant check
            if (dbItem.restaurant_id !== parseInt(restaurant_id, 10)) {
                return res.status(400).json({
                    success: false,
                    message: `Dish "${dbItem.name}" belongs to a different restaurant. An order can only contain items from one restaurant.`
                });
            }

            // Availability check
            if (!dbItem.is_available) {
                return res.status(400).json({
                    success: false,
                    message: `"${dbItem.name}" is currently sold out or unavailable.`
                });
            }

            const qty = parseInt(reqItem.quantity, 10);
            if (!qty || qty <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for "${dbItem.name}". Must be at least 1.`
                });
            }

            const unitPrice = parseFloat(dbItem.price);
            const lineSubtotal = Math.round(unitPrice * qty * 100) / 100;
            subtotal += lineSubtotal;

            verifiedOrderItems.push({
                item_id: dbItem.item_id,
                item_name_snapshot: dbItem.name,
                unit_price: unitPrice,
                quantity: qty,
                item_subtotal: lineSubtotal,
                notes: reqItem.notes ? reqItem.notes.trim() : null
            });
        }

        // Server-side calculation of taxes, fees, and grand total
        const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
        const deliveryFee = 40.00; // Standard flat delivery fee
        const discountAmount = 0.00;
        const totalAmount = Math.round((subtotal + taxAmount + deliveryFee - discountAmount) * 100) / 100;

        // 5. ATOMIC DATABASE TRANSACTION
        await connection.beginTransaction();

        // 5.1 Insert Order Header
        const [orderResult] = await connection.execute(
            `INSERT INTO orders 
             (user_id, restaurant_id, delivery_address_id, delivery_address_snapshot, 
              order_status, subtotal, tax_amount, delivery_fee, discount_amount, total_amount, special_instructions)
             VALUES (?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, ?, ?)`,
            [
                req.user.user_id,
                restaurant_id,
                delivery_address_id,
                addressSnapshot,
                subtotal,
                taxAmount,
                deliveryFee,
                discountAmount,
                totalAmount,
                special_instructions ? special_instructions.trim() : null
            ]
        );

        const newOrderId = orderResult.insertId;

        // 5.2 Insert Line Items with frozen prices
        for (const item of verifiedOrderItems) {
            await connection.execute(
                `INSERT INTO order_items 
                 (order_id, item_id, item_name_snapshot, unit_price, quantity, item_subtotal, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    newOrderId,
                    item.item_id,
                    item.item_name_snapshot,
                    item.unit_price,
                    item.quantity,
                    item.item_subtotal,
                    item.notes
                ]
            );
        }

        // 5.3 Insert Payment Record
        const txnRef = `TXN_${Date.now()}_${newOrderId}`;
        const paymentStatus = selectedMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'COMPLETED';

        await connection.execute(
            `INSERT INTO payments 
             (order_id, transaction_reference, payment_method, payment_status, amount, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                newOrderId,
                txnRef,
                selectedMethod,
                paymentStatus,
                totalAmount,
                selectedMethod === 'CASH_ON_DELIVERY' ? 'To be collected in cash upon delivery' : 'Payment confirmed via simulated gateway'
            ]
        );

        // Commit all changes together
        await connection.commit();

        return res.status(201).json({
            success: true,
            message: 'Order placed successfully.',
            data: {
                order_id: newOrderId,
                restaurant_name: restaurants[0].name,
                order_status: 'CONFIRMED',
                subtotal,
                tax_amount: taxAmount,
                delivery_fee: deliveryFee,
                total_amount: totalAmount,
                payment_method: selectedMethod,
                payment_status: paymentStatus,
                transaction_reference: txnRef,
                items: verifiedOrderItems
            }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

/**
 * Get authenticated customer's order history
 * GET /api/orders/my-orders
 */
const getMyOrders = async (req, res, next) => {
    try {
        const [orders] = await pool.execute(
            `SELECT 
                o.order_id, o.order_date, o.order_status, o.subtotal, o.tax_amount,
                o.delivery_fee, o.discount_amount, o.total_amount, o.delivered_at,
                r.restaurant_id, r.name AS restaurant_name, r.image_url AS restaurant_image,
                p.payment_method, p.payment_status,
                rev.review_id, rev.rating AS review_rating
             FROM orders o
             JOIN restaurants r ON o.restaurant_id = r.restaurant_id
             LEFT JOIN payments p ON o.order_id = p.order_id
             LEFT JOIN reviews rev ON o.order_id = rev.order_id
             WHERE o.user_id = ?
             ORDER BY o.order_date DESC`,
            [req.user.user_id]
        );

        return res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get detailed receipt for a specific order by ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
    try {
        const orderId = req.params.id;

        const [orders] = await pool.execute(
            `SELECT 
                o.order_id, o.user_id, o.restaurant_id, o.delivery_address_id,
                o.delivery_address_snapshot, o.order_status, o.subtotal, o.tax_amount,
                o.delivery_fee, o.discount_amount, o.total_amount, o.special_instructions,
                o.order_date, o.delivered_at,
                u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
                r.name AS restaurant_name, r.phone AS restaurant_phone, r.address AS restaurant_address,
                p.payment_id, p.payment_method, p.payment_status, p.transaction_reference, p.payment_date,
                rev.review_id, rev.rating AS review_rating, rev.comment AS review_comment
             FROM orders o
             JOIN users u ON o.user_id = u.user_id
             JOIN restaurants r ON o.restaurant_id = r.restaurant_id
             LEFT JOIN payments p ON o.order_id = p.order_id
             LEFT JOIN reviews rev ON o.order_id = rev.order_id
             WHERE o.order_id = ?`,
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        const order = orders[0];

        // Authorization check: Customer can only view their own order
        if (req.user.role === 'customer' && order.user_id !== req.user.user_id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You are not authorized to view this order.'
            });
        }

        // Fetch line items
        const [items] = await pool.execute(
            `SELECT order_item_id, item_id, item_name_snapshot, unit_price, quantity, item_subtotal, notes
             FROM order_items
             WHERE order_id = ?`,
            [orderId]
        );

        return res.json({
            success: true,
            data: {
                ...order,
                items
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update order status (Admin or Restaurant Manager)
 * PATCH /api/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const [orders] = await pool.execute(
            'SELECT order_id, restaurant_id, order_status FROM orders WHERE order_id = ?',
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        const currentOrder = orders[0];
        const currentStatus = currentOrder.order_status;

        // Restaurant manager check
        if (req.user.role === 'restaurant_manager') {
            const [restaurant] = await pool.execute(
                'SELECT manager_id FROM restaurants WHERE restaurant_id = ?',
                [currentOrder.restaurant_id]
            );
            if (restaurant.length === 0 || restaurant[0].manager_id !== req.user.user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: You do not manage this order\'s restaurant.'
                });
            }
        }

        // Validate state machine transition
        const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
        if (!allowedNext.includes(status) && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from "${currentStatus}" to "${status}". Allowed: ${allowedNext.join(', ') || 'None (terminal state)'}`
            });
        }

        const deliveredAtClause = status === 'DELIVERED' ? ', delivered_at = CURRENT_TIMESTAMP' : '';
        await pool.execute(
            `UPDATE orders SET order_status = ? ${deliveredAtClause} WHERE order_id = ?`,
            [status, orderId]
        );

        // If order delivered and payment was COD, mark payment as COMPLETED
        if (status === 'DELIVERED') {
            await pool.execute(
                "UPDATE payments SET payment_status = 'COMPLETED' WHERE order_id = ? AND payment_status = 'PENDING'",
                [orderId]
            );
        }

        return res.json({
            success: true,
            message: `Order status updated to ${status}.`,
            data: {
                order_id: orderId,
                previous_status: currentStatus,
                new_status: status
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Customer Order Cancellation (Only permitted when PENDING or CONFIRMED)
 * POST /api/orders/:id/cancel
 */
const cancelOrder = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const orderId = req.params.id;

        const [orders] = await connection.execute(
            'SELECT order_id, user_id, order_status FROM orders WHERE order_id = ?',
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        const order = orders[0];

        // Verify customer ownership unless admin
        if (req.user.role === 'customer' && order.user_id !== req.user.user_id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You cannot cancel another customer\'s order.'
            });
        }

        // Cancellation rule: Only PENDING or CONFIRMED
        if (!['PENDING', 'CONFIRMED'].includes(order.order_status) && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order in "${order.order_status}" status. Orders can only be cancelled before kitchen preparation begins.`
            });
        }

        await connection.beginTransaction();

        await connection.execute(
            "UPDATE orders SET order_status = 'CANCELLED' WHERE order_id = ?",
            [orderId]
        );

        // Auto refund payment if it was paid
        await connection.execute(
            "UPDATE payments SET payment_status = 'REFUNDED', notes = CONCAT(COALESCE(notes, ''), ' [Order cancelled; refund processed]') WHERE order_id = ? AND payment_status = 'COMPLETED'",
            [orderId]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: 'Order has been successfully cancelled.'
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};

