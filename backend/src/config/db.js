const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// SSL Configuration for Cloud Databases (TiDB Cloud, Aiven, etc.)
const certPath = path.join(__dirname, '../../certs/ca.pem');
const hasCaCert = fs.existsSync(certPath);

const isCloudDb = process.env.DB_SSL === 'true' || 
                  hasCaCert ||
                  (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1');

const sslConfig = isCloudDb ? {
    minVersion: 'TLSv1.2',
    ca: hasCaCert ? fs.readFileSync(certPath) : (process.env.TIDB_CA_CERT || undefined),
    rejectUnauthorized: hasCaCert || Boolean(process.env.TIDB_CA_CERT)
} : undefined;

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
        console.log(`[Database] Successfully connected to MySQL at ${host}:${port}/${db}`);
        if (hasCaCert) {
            console.log('[Database] Verified TLS connection using backend/certs/ca.pem');
        }
        connection.release();
        return true;
    } catch (error) {
        console.error('[Database] Connection Failed:', error.message);
        console.error('[Database] Tip: Ensure MySQL server is running and credentials in environment variables are correct.');
        return false;
    }
};

module.exports = {
    pool,
    testConnection
};
