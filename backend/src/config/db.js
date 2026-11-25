const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Determine SSL options for cloud-hosted databases (e.g. TiDB Cloud, Aiven)
const isCloudDb = process.env.DB_SSL === 'true' || 
                  (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1');

// Resolve CA certificate path safely whether running from backend/ or project root
const resolveCaPath = () => {
    const specified = process.env.DB_SSL_CA || 'certs/ca.pem';
    const directPath = path.resolve(process.cwd(), specified);
    if (fs.existsSync(directPath)) return directPath;
    const backendPath = path.resolve(process.cwd(), 'backend', specified);
    if (fs.existsSync(backendPath)) return backendPath;
    const parentPath = path.resolve(__dirname, '../../certs/ca.pem');
    if (fs.existsSync(parentPath)) return parentPath;
    return directPath;
};

const sslConfig = isCloudDb
    ? {
        minVersion: 'TLSv1.2',
        ca: fs.readFileSync(resolveCaPath()),
        rejectUnauthorized: true
    }
    : undefined;

let pool;

if (process.env.DATABASE_URL) {
    // If a full connection string URI is provided
    pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
        queueLimit: 0,
        decimalNumbers: true,
        ssl: sslConfig
    });
} else {
    // Standard host/port/user/password configuration
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'food_ordering_db',
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
        queueLimit: 0,
        decimalNumbers: true,
        ssl: sslConfig
    });
}

/**
 * Verify database connectivity during server startup
 */
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 3306;
        const db = process.env.DB_NAME || 'food_ordering_db';
        console.log(`[Database] Successfully connected to MySQL / TiDB at ${host}:${port}/${db}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('[Database] Connection Failed:', error.message);
        console.error('[Database] Tip: Ensure TiDB Cloud is accessible and credentials in backend/.env are correct.');
        return false;
    }
};

module.exports = {
    pool,
    testConnection
};
