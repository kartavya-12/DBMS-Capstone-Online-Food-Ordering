const { pool } = require('../config/db');

/**
 * Submit a review for a delivered order
 * POST /api/reviews
 */
const createReview = async (req, res, next) => {
    try {
        const { order_id, rating, comment } = req.body;

        if (!order_id || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and rating score (1 to 5) are required.'
            });
        }

        const numRating = parseInt(rating, 10);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5.'
            });
        }

        // Verify order exists, belongs to user, and is DELIVERED
        const [orders] = await pool.execute(
            'SELECT order_id, user_id, restaurant_id, order_status FROM orders WHERE order_id = ?',
            [order_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        const order = orders[0];

        if (order.user_id !== req.user.user_id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only review orders that you placed.'
            });
        }

        if (order.order_status !== 'DELIVERED') {
            return res.status(400).json({
                success: false,
                message: `Cannot review an order that has not been delivered (Current status: ${order.order_status}).`
            });
        }

        // Check if already reviewed
        const [existing] = await pool.execute('SELECT review_id FROM reviews WHERE order_id = ?', [order_id]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'You have already submitted a review for this order.'
            });
        }

        // Insert review (database triggers will automatically update restaurant rating_avg and total_reviews!)
        const [result] = await pool.execute(
            'INSERT INTO reviews (user_id, restaurant_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [req.user.user_id, order.restaurant_id, order_id, numRating, comment ? comment.trim() : null]
        );

        return res.status(201).json({
            success: true,
            message: 'Thank you! Your review and rating have been posted.',
            data: {
                review_id: result.insertId,
                rating: numRating,
                comment: comment ? comment.trim() : null
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get reviews for a restaurant
 * GET /api/reviews/restaurant/:restaurantId
 */
const getRestaurantReviews = async (req, res, next) => {
    try {
        const restaurantId = req.params.restaurantId;

        const [reviews] = await pool.execute(
            `SELECT 
                rev.review_id, rev.rating, rev.comment, rev.created_at,
                u.name AS customer_name
             FROM reviews rev
             JOIN users u ON rev.user_id = u.user_id
             WHERE rev.restaurant_id = ?
             ORDER BY rev.created_at DESC`,
            [restaurantId]
        );

        return res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Moderate / Delete a review (Admin only)
 * DELETE /api/reviews/:id
 */
const deleteReview = async (req, res, next) => {
    try {
        const reviewId = req.params.id;

        const [result] = await pool.execute('DELETE FROM reviews WHERE review_id = ?', [reviewId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.'
            });
        }

        return res.json({
            success: true,
            message: 'Review deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getRestaurantReviews,
    deleteReview
};

