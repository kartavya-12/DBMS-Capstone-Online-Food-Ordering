const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Authentication Middleware:
 * Extracts Bearer token from Authorization header and verifies claims.
 * Populates req.user with the active user record from the database.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No authentication token provided.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_capstone_key_replace_in_production_2026');

        // Parameterized query ensuring user still exists and is active
        const [users] = await pool.execute(
            'SELECT user_id, name, email, phone, role, is_active FROM users WHERE user_id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid session. User account no longer exists.'
            });
        }

        const user = users[0];
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account has been deactivated. Please contact support.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Authentication token has expired. Please log in again.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid or malformed authentication token.'
        });
    }
};

/**
 * Optional Authentication Middleware:
 * If a token is provided, populates req.user; otherwise leaves it null and continues.
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_capstone_key_replace_in_production_2026');
            const [users] = await pool.execute(
                'SELECT user_id, name, email, phone, role, is_active FROM users WHERE user_id = ?',
                [decoded.userId]
            );
            if (users.length > 0 && users[0].is_active) {
                req.user = users[0];
            }
        }
    } catch {
        // Silently continue without authenticated user
    }
    next();
};

module.exports = {
    authenticate,
    optionalAuth
};

