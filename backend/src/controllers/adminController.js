const { pool } = require('../config/db');

/**
 * Get high-level Admin Dashboard KPIs
 * GET /api/admin/kpis
 */
const getDashboardKPIs = async (req, res, next) => {
    try {
        // Query 1: Total Gross Revenue (from delivered orders)
        const [revenueRes] = await pool.execute(
            "SELECT COALESCE(SUM(total_amount), 0.00) AS gross_revenue FROM orders WHERE order_status = 'DELIVERED'"
        );

        // Query 2: Total Orders and status breakdown
        const [ordersRes] = await pool.execute(`
            SELECT 
                COUNT(*) AS total_orders,
                SUM(CASE WHEN order_status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered_orders,
                SUM(CASE WHEN order_status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_orders,
                SUM(CASE WHEN order_status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY') THEN 1 ELSE 0 END) AS active_orders
            FROM orders
        `);

        // Query 3: Total Customers & Restaurants
        const [usersRes] = await pool.execute(
            "SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer' AND is_active = TRUE"
        );
        const [restaurantsRes] = await pool.execute(
            'SELECT COUNT(*) AS active_restaurants FROM restaurants WHERE is_active = TRUE'
        );

        // Query 4: Recent 5 orders
        const [recentOrders] = await pool.execute(`
            SELECT 
                o.order_id, o.order_date, o.order_status, o.total_amount,
                u.name AS customer_name,
                r.name AS restaurant_name
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            JOIN restaurants r ON o.restaurant_id = r.restaurant_id
            ORDER BY o.order_date DESC
            LIMIT 5
        `);

        return res.json({
            success: true,
            data: {
                gross_revenue: revenueRes[0].gross_revenue,
                total_orders: ordersRes[0].total_orders,
                delivered_orders: ordersRes[0].delivered_orders,
                cancelled_orders: ordersRes[0].cancelled_orders,
                active_orders: ordersRes[0].active_orders,
                total_customers: usersRes[0].total_customers,
                active_restaurants: restaurantsRes[0].active_restaurants,
                recent_orders: recentOrders
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Comprehensive Sales & Analytics Report
 * GET /api/admin/reports
 */
const getSalesReport = async (req, res, next) => {
    try {
        // Monthly revenue trends
        const [monthlySales] = await pool.execute(`
            SELECT 
                DATE_FORMAT(o.order_date, '%Y-%m') AS month,
                COUNT(o.order_id) AS total_orders,
                COALESCE(SUM(CASE WHEN o.order_status = 'DELIVERED' THEN o.total_amount ELSE 0 END), 0.00) AS revenue
            FROM orders o
            GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
            ORDER BY month DESC
            LIMIT 12
        `);

        // Restaurant-wise performance from View
        const [restaurantSales] = await pool.execute(`
            SELECT 
                restaurant_id, restaurant_name, city, rating_avg,
                total_orders, gross_revenue, average_order_value
            FROM vw_restaurant_performance
            ORDER BY gross_revenue DESC
        `);

        // Top 5 popular dishes from View
        const [popularDishes] = await pool.execute(`
            SELECT 
                item_name, restaurant_name, category_name, current_price,
                times_ordered, total_revenue_generated
            FROM vw_popular_menu_items
            ORDER BY times_ordered DESC
            LIMIT 5
        `);

        // Top 5 spending customers from View
        const [topCustomers] = await pool.execute(`
            SELECT 
                customer_name, email, phone,
                total_orders_placed, total_spent, avg_ticket_size
            FROM vw_customer_spending_summary
            ORDER BY total_spent DESC
            LIMIT 5
        `);

        return res.json({
            success: true,
            data: {
                monthly_sales: monthlySales,
                restaurant_sales: restaurantSales,
                popular_dishes: popularDishes,
                top_customers: topCustomers
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List all users with account management (Admin only)
 * GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { role, is_active } = req.query;

        let query = `
            SELECT 
                u.user_id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
                COUNT(o.order_id) AS order_count
            FROM users u
            LEFT JOIN orders o ON u.user_id = o.user_id
            WHERE 1=1
        `;
        const params = [];

        if (role) {
            query += ' AND u.role = ?';
            params.push(role);
        }

        if (is_active !== undefined) {
            query += ' AND u.is_active = ?';
            params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
        }

        query += ' GROUP BY u.user_id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at ORDER BY u.created_at DESC';

        const [users] = await pool.execute(query, params);

        return res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle user active/blocked status
 * PATCH /api/admin/users/:id/status
 */
const toggleUserStatus = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const { is_active } = req.body;

        if (parseInt(targetUserId, 10) === req.user.user_id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify your own administrator account status.'
            });
        }

        await pool.execute(
            'UPDATE users SET is_active = ? WHERE user_id = ?',
            [Boolean(is_active), targetUserId]
        );

        return res.json({
            success: true,
            message: `User status changed to ${is_active ? 'Active' : 'Deactivated'}.`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all platform orders (Admin or Manager Pipeline)
 * GET /api/admin/orders
 */
const getAllOrders = async (req, res, next) => {
    try {
        const { status, restaurant_id } = req.query;

        let query = `
            SELECT 
                o.order_id, o.order_date, o.order_status, o.total_amount,
                o.subtotal, o.tax_amount, o.delivery_fee, o.special_instructions,
                u.name AS customer_name, u.phone AS customer_phone,
                r.restaurant_id, r.name AS restaurant_name,
                p.payment_method, p.payment_status
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            JOIN restaurants r ON o.restaurant_id = r.restaurant_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            WHERE 1=1
        `;
        const params = [];

        // If restaurant manager, filter to only their restaurant
        if (req.user.role === 'restaurant_manager') {
            query += ' AND r.manager_id = ?';
            params.push(req.user.user_id);
        } else if (restaurant_id) {
            query += ' AND o.restaurant_id = ?';
            params.push(parseInt(restaurant_id, 10));
        }

        if (status) {
            query += ' AND o.order_status = ?';
            params.push(status);
        }

        query += ' ORDER BY o.order_date DESC';

        const [orders] = await pool.execute(query, params);

        return res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardKPIs,
    getSalesReport,
    getAllUsers,
    toggleUserStatus,
    getAllOrders
};

