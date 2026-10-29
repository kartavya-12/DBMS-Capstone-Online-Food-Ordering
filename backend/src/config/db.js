const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'food_ordering_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: 0,
    decimalNumbers: true // parses DECIMAL as JavaScript numbers instead of strings where safe
});

/**
 * Verify database connectivity during server startup
 */
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`[Database] Successfully connected to MySQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'food_ordering_db'}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('[Database] Connection Failed:', error.message);
        console.error('[Database] Tip: Ensure MySQL80 is running and credentials in backend/.env are correct.');
        return false;
    }
};

module.exports = {
    pool,
    testConnection
};

