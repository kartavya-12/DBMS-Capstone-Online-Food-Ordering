const express = require('express');
const router = express.Router();
const {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menuController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', optionalAuth, getAllMenuItems);
router.get('/:id', optionalAuth, getMenuItemById);

router.post('/', authenticate, authorize('admin', 'restaurant_manager'), createMenuItem);
router.put('/:id', authenticate, authorize('admin', 'restaurant_manager'), updateMenuItem);
router.delete('/:id', authenticate, authorize('admin', 'restaurant_manager'), deleteMenuItem);

module.exports = router;

