const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Generate a signed JSON Web Token
 */
const generateToken = (user) => {
    return jwt.sign(
        { userId: user.user_id, role: user.role, email: user.email },
        process.env.JWT_SECRET || 'super_secret_jwt_capstone_key_replace_in_production_2026',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Customer Registration
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields (name, email, password, phone) are required.'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // Check if email already registered
        const [existing] = await pool.execute('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists. Please log in.'
            });
        }

        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), email.toLowerCase().trim(), passwordHash, phone.trim(), 'customer']
        );

        const newUser = {
            user_id: result.insertId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            role: 'customer'
        };

        const token = generateToken(newUser);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: {
                token,
                user: newUser
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Universal User Login (Customer, Admin, Manager)
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Both email and password are required.'
            });
        }

        const [users] = await pool.execute(
            'SELECT user_id, name, email, password_hash, phone, role, is_active FROM users WHERE email = ?',
            [email.toLowerCase().trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Your account is currently deactivated. Please contact support.'
            });
        }

        // Verify password hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const token = generateToken(user);

        return res.json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            data: {
                token,
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Authenticated User Profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
    try {
        const [ordersCount] = await pool.execute(
            'SELECT COUNT(*) as total_orders FROM orders WHERE user_id = ?',
            [req.user.user_id]
        );
        const [addressCount] = await pool.execute(
            'SELECT COUNT(*) as total_addresses FROM user_addresses WHERE user_id = ?',
            [req.user.user_id]
        );

        return res.json({
            success: true,
            data: {
                ...req.user,
                total_orders: ordersCount[0].total_orders,
                total_addresses: addressCount[0].total_addresses
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone are required to update profile.'
            });
        }

        await pool.execute(
            'UPDATE users SET name = ?, phone = ? WHERE user_id = ?',
            [name.trim(), phone.trim(), req.user.user_id]
        );

        return res.json({
            success: true,
            message: 'Profile updated successfully.',
            data: {
                user_id: req.user.user_id,
                name: name.trim(),
                phone: phone.trim(),
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile
};

