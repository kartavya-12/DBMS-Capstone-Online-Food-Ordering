const { pool } = require('../config/db');

/**
 * Get all addresses for the authenticated customer
 * GET /api/addresses
 */
const getAddresses = async (req, res, next) => {
    try {
        const [addresses] = await pool.execute(
            'SELECT address_id, user_id, address_line1, address_line2, city, state, postal_code, landmark, is_default, created_at FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
            [req.user.user_id]
        );

        return res.json({
            success: true,
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add a new delivery address
 * POST /api/addresses
 */
const createAddress = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { address_line1, address_line2, city, state, postal_code, landmark, is_default } = req.body;

        if (!address_line1 || !city || !state || !postal_code) {
            return res.status(400).json({
                success: false,
                message: 'Address line 1, city, state, and postal code are required.'
            });
        }

        await connection.beginTransaction();

        // If marked as default, unset other addresses for this user
        if (is_default) {
            await connection.execute(
                'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?',
                [req.user.user_id]
            );
        }

        // If this is the user's first address, make it default automatically
        const [existing] = await connection.execute(
            'SELECT COUNT(*) as count FROM user_addresses WHERE user_id = ?',
            [req.user.user_id]
        );
        const shouldBeDefault = is_default || existing[0].count === 0;

        const [result] = await connection.execute(
            `INSERT INTO user_addresses 
             (user_id, address_line1, address_line2, city, state, postal_code, landmark, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.user_id,
                address_line1.trim(),
                address_line2 ? address_line2.trim() : null,
                city.trim(),
                state.trim(),
                postal_code.trim(),
                landmark ? landmark.trim() : null,
                shouldBeDefault
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: 'Address added successfully.',
            data: {
                address_id: result.insertId,
                user_id: req.user.user_id,
                address_line1: address_line1.trim(),
                address_line2: address_line2 ? address_line2.trim() : null,
                city: city.trim(),
                state: state.trim(),
                postal_code: postal_code.trim(),
                landmark: landmark ? landmark.trim() : null,
                is_default: shouldBeDefault
            }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

/**
 * Update an existing address
 * PUT /api/addresses/:id
 */
const updateAddress = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const addressId = req.params.id;
        const { address_line1, address_line2, city, state, postal_code, landmark, is_default } = req.body;

        // Verify ownership
        const [existing] = await pool.execute(
            'SELECT address_id FROM user_addresses WHERE address_id = ? AND user_id = ?',
            [addressId, req.user.user_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Address not found or unauthorized.'
            });
        }

        await connection.beginTransaction();

        if (is_default) {
            await connection.execute(
                'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?',
                [req.user.user_id]
            );
        }

        await connection.execute(
            `UPDATE user_addresses 
             SET address_line1 = ?, address_line2 = ?, city = ?, state = ?, postal_code = ?, landmark = ?, is_default = ?
             WHERE address_id = ? AND user_id = ?`,
            [
                address_line1.trim(),
                address_line2 ? address_line2.trim() : null,
                city.trim(),
                state.trim(),
                postal_code.trim(),
                landmark ? landmark.trim() : null,
                Boolean(is_default),
                addressId,
                req.user.user_id
            ]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: 'Address updated successfully.'
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

/**
 * Delete an address
 * DELETE /api/addresses/:id
 */
const deleteAddress = async (req, res, next) => {
    try {
        const addressId = req.params.id;

        // Verify ownership
        const [existing] = await pool.execute(
            'SELECT address_id, is_default FROM user_addresses WHERE address_id = ? AND user_id = ?',
            [addressId, req.user.user_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Address not found or unauthorized.'
            });
        }

        await pool.execute(
            'DELETE FROM user_addresses WHERE address_id = ? AND user_id = ?',
            [addressId, req.user.user_id]
        );

        return res.json({
            success: true,
            message: 'Address deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
};

