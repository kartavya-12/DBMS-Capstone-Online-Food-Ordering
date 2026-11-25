const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { testConnection } = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const addressRoutes = require('./src/routes/addressRoutes');
const restaurantRoutes = require('./src/routes/restaurantRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
// Allow configured CLIENT_URL or default to all origins for easy cloud deployment
const clientOrigin = process.env.CLIENT_URL;
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin || !clientOrigin || clientOrigin === '*') {
            return callback(null, true);
        }
        const allowedOrigins = clientOrigin.split(',').map(o => o.trim());
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(null, true); // Fallback to allow for smooth demonstration
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// System Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'Online Food Ordering System API',
        environment: process.env.NODE_ENV || 'development'
    });
});

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Serve Frontend Static Files in Production (if frontend is built alongside backend)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
    console.log(`[Static] Serving frontend static assets from: ${frontendDistPath}`);
    app.use(express.static(frontendDistPath));

    // For any non-API route, send index.html for Single Page Application routing
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
} else {
    // 404 Catch-All for API routes when frontend is hosted separately
    app.use('/api/*', (req, res) => {
        res.status(404).json({
            success: false,
            message: `API endpoint ${req.method} ${req.originalUrl} not found on this server.`
        });
    });
}

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, async () => {
        console.log(`================================================================`);
        console.log(`  Food Ordering API Server is running on port ${PORT}`);
        console.log(`  Health Check: http://localhost:${PORT}/api/health`);
        console.log(`================================================================`);
        await testConnection();
    });
}

module.exports = app;
