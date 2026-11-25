const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Database Auto-Migration & Seed Script
 * Connects to the target MySQL database and applies schema.sql followed by seed.sql
 */
async function initializeDatabase() {
    console.log('================================================================');
    console.log('  INITIALIZING CLOUD / LOCAL MYSQL DATABASE');
    console.log('================================================================');

    const isCloudDb = process.env.DB_SSL === 'true' || 
                      (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1');

    const config = process.env.DATABASE_URL
        ? { uri: process.env.DATABASE_URL, multipleStatements: true, ssl: isCloudDb ? { rejectUnauthorized: false } : undefined }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true,
            ssl: isCloudDb ? { rejectUnauthorized: false } : undefined
        };

    const targetDb = process.env.DB_NAME || 'food_ordering_db';

    console.log(`[1/3] Connecting to MySQL at ${process.env.DB_HOST || 'localhost'}...`);
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

        console.log('[3/3] Applying schema.sql DDL (tables, triggers, views)...');
        let schemaSql = fs.readFileSync(schemaPath, 'utf8');
        // Remove DROP/CREATE DATABASE in schema.sql if already using targetDb
        schemaSql = schemaSql.replace(/DROP DATABASE IF EXISTS food_ordering_db;/gi, '');
        schemaSql = schemaSql.replace(/CREATE DATABASE food_ordering_db[^;]*;/gi, '');
        schemaSql = schemaSql.replace(/USE food_ordering_db;/gi, '');

        // Remove DELIMITER $$ syntax for node-mysql2
        schemaSql = schemaSql.replace(/DELIMITER \$\$/g, '');
        schemaSql = schemaSql.replace(/DELIMITER ;/g, '');
        schemaSql = schemaSql.replace(/\$\$/g, ';');

        await connection.query(schemaSql);
        console.log('Schema applied successfully!');

        console.log('Applying demonstration seed data (seed.sql)...');
        let seedSql = fs.readFileSync(seedPath, 'utf8');
        seedSql = seedSql.replace(/USE food_ordering_db;/gi, '');
        await connection.query(seedSql);
        console.log('Demonstration seed data inserted successfully!');

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
