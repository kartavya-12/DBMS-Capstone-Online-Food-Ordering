const express = require('express');
const router = express.Router();
const {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
} = require('../controllers/restaurantController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public or optional auth endpoints
router.get('/', optionalAuth, getAllRestaurants);
router.get('/:id', optionalAuth, getRestaurantById);

// Admin-only creation
router.post('/', authenticate, authorize('admin'), createRestaurant);

// Admin or Restaurant Manager update
router.put('/:id', authenticate, authorize('admin', 'restaurant_manager'), updateRestaurant);

// Admin-only deletion / deactivation
router.delete('/:id', authenticate, authorize('admin'), deleteRestaurant);

module.exports = router;

