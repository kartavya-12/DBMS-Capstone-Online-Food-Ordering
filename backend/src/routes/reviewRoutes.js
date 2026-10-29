const express = require('express');
const router = express.Router();
const {
    createReview,
    getRestaurantReviews,
    deleteReview
} = require('../controllers/reviewController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public reading of reviews for a restaurant
router.get('/restaurant/:restaurantId', optionalAuth, getRestaurantReviews);

// Customer submits review for eligible completed order
router.post('/', authenticate, authorize('customer', 'admin'), createReview);

// Admin moderation
router.delete('/:id', authenticate, authorize('admin'), deleteReview);

module.exports = router;

