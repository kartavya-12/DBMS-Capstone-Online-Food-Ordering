const { pool } = require('../config/db');

/**
 * Get all menu items with search & filtering
 * GET /api/menu-items
 */
const getAllMenuItems = async (req, res, next) => {
    try {
        const { restaurant_id, category_id, is_vegetarian, search, is_available } = req.query;

        let query = `
            SELECT 
                mi.item_id, mi.restaurant_id, mi.category_id, mi.name, mi.description,
                mi.price, mi.is_vegetarian, mi.is_available, mi.image_url,
                r.name AS restaurant_name, r.city AS restaurant_city,
                c.name AS category_name
            FROM menu_items mi
            JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
            JOIN categories c ON mi.category_id = c.category_id
            WHERE r.is_active = TRUE
        `;
        const params = [];

        if (restaurant_id) {
            query += ' AND mi.restaurant_id = ?';
            params.push(parseInt(restaurant_id, 10));
        }

        if (category_id) {
            query += ' AND mi.category_id = ?';
            params.push(parseInt(category_id, 10));
        }

        if (is_vegetarian !== undefined) {
            query += ' AND mi.is_vegetarian = ?';
            params.push(is_vegetarian === 'true' || is_vegetarian === '1' ? 1 : 0);
        }

        if (is_available !== undefined) {
            query += ' AND mi.is_available = ?';
            params.push(is_available === 'true' || is_available === '1' ? 1 : 0);
        } else if (!req.user || req.user.role === 'customer') {
            query += ' AND mi.is_available = TRUE';
        }

        if (search) {
            query += ' AND (mi.name LIKE ? OR mi.description LIKE ?)';
            const term = `%${search.trim()}%`;
            params.push(term, term);
        }

        query += ' ORDER BY r.name ASC, c.name ASC, mi.name ASC';

        const [items] = await pool.execute(query, params);

        return res.json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single menu item by ID
 * GET /api/menu-items/:id
 */
const getMenuItemById = async (req, res, next) => {
    try {
        const itemId = req.params.id;

        const [items] = await pool.execute(
            `SELECT 
                mi.item_id, mi.restaurant_id, mi.category_id, mi.name, mi.description,
                mi.price, mi.is_vegetarian, mi.is_available, mi.image_url,
                r.name AS restaurant_name,
                c.name AS category_name
             FROM menu_items mi
             JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
             JOIN categories c ON mi.category_id = c.category_id
             WHERE mi.item_id = ?`,
            [itemId]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found.'
            });
        }

        return res.json({
            success: true,
            data: items[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new menu item (Admin or assigned Restaurant Manager)
 * POST /api/menu-items
 */
const createMenuItem = async (req, res, next) => {
    try {
        const { restaurant_id, category_id, name, description, price, is_vegetarian, is_available, image_url } = req.body;

        if (!restaurant_id || !category_id || !name || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant ID, Category ID, dish name, and price are required.'
            });
        }

        // If user is restaurant manager, verify assignment
        if (req.user.role === 'restaurant_manager') {
            const [check] = await pool.execute('SELECT manager_id FROM restaurants WHERE restaurant_id = ?', [restaurant_id]);
            if (check.length === 0 || check[0].manager_id !== req.user.user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: You can only create menu items for your assigned restaurant.'
                });
            }
        }

        const [result] = await pool.execute(
            `INSERT INTO menu_items 
             (restaurant_id, category_id, name, description, price, is_vegetarian, is_available, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                restaurant_id,
                category_id,
                name.trim(),
                description ? description.trim() : null,
                parseFloat(price),
                Boolean(is_vegetarian),
                is_available !== undefined ? Boolean(is_available) : true,
                image_url ? image_url.trim() : null
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Menu item created successfully.',
            data: {
                item_id: result.insertId,
                name: name.trim(),
                price: parseFloat(price)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update menu item (Admin or assigned Restaurant Manager)
 * PUT /api/menu-items/:id
 */
const updateMenuItem = async (req, res, next) => {
    try {
        const itemId = req.params.id;

        // Retrieve existing item
        const [existing] = await pool.execute(
            'SELECT mi.item_id, mi.restaurant_id, r.manager_id FROM menu_items mi JOIN restaurants r ON mi.restaurant_id = r.restaurant_id WHERE mi.item_id = ?',
            [itemId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found.'
            });
        }

        if (req.user.role === 'restaurant_manager' && existing[0].manager_id !== req.user.user_id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You are not authorized to edit items for this restaurant.'
            });
        }

        const { category_id, name, description, price, is_vegetarian, is_available, image_url } = req.body;

        await pool.execute(
            `UPDATE menu_items SET
                category_id = COALESCE(?, category_id),
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                is_vegetarian = COALESCE(?, is_vegetarian),
                is_available = COALESCE(?, is_available),
                image_url = COALESCE(?, image_url)
             WHERE item_id = ?`,
            [
                category_id || null,
                name ? name.trim() : null,
                description !== undefined ? description : null,
                price !== undefined ? parseFloat(price) : null,
                is_vegetarian !== undefined ? Boolean(is_vegetarian) : null,
                is_available !== undefined ? Boolean(is_available) : null,
                image_url !== undefined ? image_url : null,
                itemId
            ]
        );

        return res.json({
            success: true,
            message: 'Menu item updated successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete menu item (Admin or assigned Manager)
 * DELETE /api/menu-items/:id
 */
const deleteMenuItem = async (req, res, next) => {
    try {
        const itemId = req.params.id;

        const [existing] = await pool.execute(
            'SELECT mi.item_id, mi.restaurant_id, r.manager_id FROM menu_items mi JOIN restaurants r ON mi.restaurant_id = r.restaurant_id WHERE mi.item_id = ?',
            [itemId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found.'
            });
        }

        if (req.user.role === 'restaurant_manager' && existing[0].manager_id !== req.user.user_id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Unauthorized to delete items for this restaurant.'
            });
        }

        // Check if item has past order history
        const [orders] = await pool.execute('SELECT COUNT(*) as count FROM order_items WHERE item_id = ?', [itemId]);
        if (orders[0].count > 0) {
            // Soft-delete by marking unavailable to preserve historical order receipts
            await pool.execute('UPDATE menu_items SET is_available = FALSE WHERE item_id = ?', [itemId]);
            return res.json({
                success: true,
                message: 'Item has past order history; marked as unavailable instead of permanently deleting to maintain relational integrity.'
            });
        }

        await pool.execute('DELETE FROM menu_items WHERE item_id = ?', [itemId]);

        return res.json({
            success: true,
            message: 'Menu item deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};

