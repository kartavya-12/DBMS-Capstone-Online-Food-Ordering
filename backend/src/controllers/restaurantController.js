const { pool } = require('../config/db');

/**
 * Get all restaurants (with filters & search)
 * GET /api/restaurants
 */
const getAllRestaurants = async (req, res, next) => {
    try {
        const { search, city, rating, is_active } = req.query;

        let query = `
            SELECT 
                r.restaurant_id,
                r.manager_id,
                r.name,
                r.description,
                r.address,
                r.city,
                r.phone,
                r.email,
                r.opening_time,
                r.closing_time,
                r.rating_avg,
                r.total_reviews,
                r.is_active,
                r.image_url,
                u.name AS manager_name
            FROM restaurants r
            LEFT JOIN users u ON r.manager_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        // For non-admin, only show active restaurants
        if (!req.user || req.user.role === 'customer') {
            query += ' AND r.is_active = TRUE';
        } else if (is_active !== undefined) {
            query += ' AND r.is_active = ?';
            params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
        }

        if (search) {
            query += ' AND (r.name LIKE ? OR r.description LIKE ?)';
            const term = `%${search.trim()}%`;
            params.push(term, term);
        }

        if (city) {
            query += ' AND r.city = ?';
            params.push(city.trim());
        }

        if (rating) {
            query += ' AND r.rating_avg >= ?';
            params.push(parseFloat(rating));
        }

        query += ' ORDER BY r.rating_avg DESC, r.name ASC';

        const [restaurants] = await pool.execute(query, params);

        return res.json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single restaurant by ID with its menu items and recent reviews
 * GET /api/restaurants/:id
 */
const getRestaurantById = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;

        const [restaurants] = await pool.execute(
            `SELECT 
                r.restaurant_id, r.manager_id, r.name, r.description, r.address,
                r.city, r.phone, r.email, r.opening_time, r.closing_time,
                r.rating_avg, r.total_reviews, r.is_active, r.image_url,
                u.name AS manager_name
             FROM restaurants r
             LEFT JOIN users u ON r.manager_id = u.user_id
             WHERE r.restaurant_id = ?`,
            [restaurantId]
        );

        if (restaurants.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found.'
            });
        }

        // Fetch menu items for this restaurant
        const [menuItems] = await pool.execute(
            `SELECT 
                mi.item_id, mi.category_id, mi.name, mi.description,
                mi.price, mi.is_vegetarian, mi.is_available, mi.image_url,
                c.name AS category_name
             FROM menu_items mi
             JOIN categories c ON mi.category_id = c.category_id
             WHERE mi.restaurant_id = ? AND mi.is_available = TRUE
             ORDER BY c.name ASC, mi.name ASC`,
            [restaurantId]
        );

        // Fetch recent reviews
        const [reviews] = await pool.execute(
            `SELECT 
                rev.review_id, rev.rating, rev.comment, rev.created_at,
                u.name AS customer_name
             FROM reviews rev
             JOIN users u ON rev.user_id = u.user_id
             WHERE rev.restaurant_id = ?
             ORDER BY rev.created_at DESC
             LIMIT 10`,
            [restaurantId]
        );

        return res.json({
            success: true,
            data: {
                ...restaurants[0],
                menu_items: menuItems,
                reviews: reviews
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new restaurant (Admin only)
 * POST /api/restaurants
 */
const createRestaurant = async (req, res, next) => {
    try {
        const {
            name, description, address, city, phone, email,
            opening_time, closing_time, image_url, manager_id
        } = req.body;

        if (!name || !address || !city || !phone || !email || !opening_time || !closing_time) {
            return res.status(400).json({
                success: false,
                message: 'Name, address, city, phone, email, opening time, and closing time are required.'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO restaurants 
             (manager_id, name, description, address, city, phone, email, opening_time, closing_time, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                manager_id || null,
                name.trim(),
                description ? description.trim() : null,
                address.trim(),
                city.trim(),
                phone.trim(),
                email.trim(),
                opening_time,
                closing_time,
                image_url ? image_url.trim() : null
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Restaurant registered successfully.',
            data: {
                restaurant_id: result.insertId,
                name: name.trim()
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update restaurant (Admin or assigned Manager)
 * PUT /api/restaurants/:id
 */
const updateRestaurant = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;

        // Check authorization if manager
        if (req.user.role === 'restaurant_manager') {
            const [check] = await pool.execute(
                'SELECT manager_id FROM restaurants WHERE restaurant_id = ?',
                [restaurantId]
            );
            if (check.length === 0 || check[0].manager_id !== req.user.user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: You are not assigned to manage this restaurant.'
                });
            }
        }

        const {
            name, description, address, city, phone, email,
            opening_time, closing_time, is_active, image_url, manager_id
        } = req.body;

        await pool.execute(
            `UPDATE restaurants SET 
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                address = COALESCE(?, address),
                city = COALESCE(?, city),
                phone = COALESCE(?, phone),
                email = COALESCE(?, email),
                opening_time = COALESCE(?, opening_time),
                closing_time = COALESCE(?, closing_time),
                is_active = COALESCE(?, is_active),
                image_url = COALESCE(?, image_url),
                manager_id = COALESCE(?, manager_id)
             WHERE restaurant_id = ?`,
            [
                name ? name.trim() : null,
                description !== undefined ? description : null,
                address ? address.trim() : null,
                city ? city.trim() : null,
                phone ? phone.trim() : null,
                email ? email.trim() : null,
                opening_time || null,
                closing_time || null,
                is_active !== undefined ? is_active : null,
                image_url !== undefined ? image_url : null,
                manager_id !== undefined ? manager_id : null,
                restaurantId
            ]
        );

        return res.json({
            success: true,
            message: 'Restaurant updated successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Deactivate or Delete Restaurant (Admin only)
 * DELETE /api/restaurants/:id
 */
const deleteRestaurant = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;

        // Check if there are orders
        const [orders] = await pool.execute(
            'SELECT COUNT(*) as count FROM orders WHERE restaurant_id = ?',
            [restaurantId]
        );

        if (orders[0].count > 0) {
            // Soft delete / deactivate to protect order histories
            await pool.execute(
                'UPDATE restaurants SET is_active = FALSE WHERE restaurant_id = ?',
                [restaurantId]
            );
            return res.json({
                success: true,
                message: 'Restaurant has past order history; it has been deactivated rather than deleted to preserve relational integrity.'
            });
        }

        await pool.execute('DELETE FROM restaurants WHERE restaurant_id = ?', [restaurantId]);
        return res.json({
            success: true,
            message: 'Restaurant deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
};

