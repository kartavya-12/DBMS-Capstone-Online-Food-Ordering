const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Database Auto-Migration & Seed Script
 * Connects to the target MySQL / TiDB database and applies schema.sql followed by seed.sql
 */
async function initializeDatabase() {
    console.log('================================================================');
    console.log('  INITIALIZING CLOUD / LOCAL MYSQL DATABASE');
    console.log('================================================================');

    const isCloudDb = process.env.DB_SSL === 'true' || 
                      (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1');

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

    if (isCloudDb) {
        console.log(`[SSL] Using CA Certificate from ${resolveCaPath()}`);
    }

    const config = process.env.DATABASE_URL
        ? {
            uri: process.env.DATABASE_URL,
            multipleStatements: true,
            ssl: isCloudDb
                ? {
                    minVersion: 'TLSv1.2',
                    ca: fs.readFileSync(resolveCaPath()),
                    rejectUnauthorized: true
                }
                : undefined
        }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true,
            ssl: isCloudDb
                ? {
                    minVersion: 'TLSv1.2',
                    ca: fs.readFileSync(resolveCaPath()),
                    rejectUnauthorized: true
                }
                : undefined
        };

    const targetDb = process.env.DB_NAME || 'food_ordering_db';

    console.log(`[1/3] Connecting to database at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}...`);
    const connection = await mysql.createConnection(config);
    console.log('Connected successfully!');

    try {
        console.log(`[2/3] Ensuring database "${targetDb}" exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.query(`USE \`${targetDb}\`;`);

        // Read schema and seed files
        const schemaPath = path.join(__dirname, '../../../database/schema.sql');
        const seedPath = path.join(__dirname, '../../../database/seed.sql');

        if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
            throw new Error(`Schema or seed file not found. Checked: ${schemaPath}`);
        }

        console.log('[3/3] Applying schema.sql DDL (tables, views)...');
        let schemaSql = fs.readFileSync(schemaPath, 'utf8');
        // Remove DROP/CREATE DATABASE in schema.sql if already using targetDb
        schemaSql = schemaSql.replace(/DROP DATABASE IF EXISTS food_ordering_db;/gi, '');
        schemaSql = schemaSql.replace(/CREATE DATABASE food_ordering_db[^;]*;/gi, '');
        schemaSql = schemaSql.replace(/USE food_ordering_db;/gi, '');

        await connection.query(schemaSql);
        console.log('Schema applied successfully!');

        console.log('Applying demonstration seed data (seed.sql)...');
        let seedSql = fs.readFileSync(seedPath, 'utf8');
        seedSql = seedSql.replace(/USE food_ordering_db;/gi, '');
        await connection.query(seedSql);
        console.log('Demonstration seed data inserted successfully!');

        // Recalculate restaurant ratings because TiDB does not support triggers
        await connection.query(`
            UPDATE restaurants r
            LEFT JOIN (
                SELECT
                    restaurant_id,
                    ROUND(AVG(rating), 2) AS avg_rating,
                    COUNT(*) AS review_count
                FROM reviews
                GROUP BY restaurant_id
            ) rev ON r.restaurant_id = rev.restaurant_id
            SET
                r.rating_avg = COALESCE(rev.avg_rating, 0),
                r.total_reviews = COALESCE(rev.review_count, 0);
        `);

        console.log('Restaurant ratings updated successfully!');

        console.log('\n================================================================');
        console.log('  DATABASE INITIALIZATION COMPLETE! ALL TABLES & SEED DATA READY');
        console.log('================================================================');
    } catch (err) {
        console.error('Database initialization error:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

initializeDatabase();
