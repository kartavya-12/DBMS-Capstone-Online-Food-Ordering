const { pool } = require('../config/db');

/**
 * Get all active categories
 * GET /api/categories
 */
const getAllCategories = async (req, res, next) => {
    try {
        const [categories] = await pool.execute(
            `SELECT 
                c.category_id, c.name, c.description, c.image_url, c.is_active,
                COUNT(mi.item_id) AS total_items
             FROM categories c
             LEFT JOIN menu_items mi ON c.category_id = mi.category_id AND mi.is_available = TRUE
             WHERE c.is_active = TRUE
             GROUP BY c.category_id, c.name, c.description, c.image_url, c.is_active
             ORDER BY c.name ASC`
        );

        return res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new category (Admin only)
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
    try {
        const { name, description, image_url } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required.'
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
            [name.trim(), description ? description.trim() : null, image_url ? image_url.trim() : null]
        );

        return res.status(201).json({
            success: true,
            message: 'Category created successfully.',
            data: {
                category_id: result.insertId,
                name: name.trim()
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update category (Admin only)
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const { name, description, image_url, is_active } = req.body;

        await pool.execute(
            `UPDATE categories SET 
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                image_url = COALESCE(?, image_url),
                is_active = COALESCE(?, is_active)
             WHERE category_id = ?`,
            [
                name ? name.trim() : null,
                description !== undefined ? description : null,
                image_url !== undefined ? image_url : null,
                is_active !== undefined ? is_active : null,
                categoryId
            ]
        );

        return res.json({
            success: true,
            message: 'Category updated successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete category (Admin only)
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.id;

        // Check if items exist under this category
        const [items] = await pool.execute(
            'SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?',
            [categoryId]
        );

        if (items[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category: ${items[0].count} menu items are currently assigned to it. Reassign or delete those items first.`
            });
        }

        await pool.execute('DELETE FROM categories WHERE category_id = ?', [categoryId]);

        return res.json({
            success: true,
            message: 'Category deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};

