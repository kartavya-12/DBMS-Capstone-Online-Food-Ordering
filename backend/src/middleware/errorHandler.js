/**
 * Centralized Application Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('[Error Details]:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        sqlMessage: err.sqlMessage,
        sql: err.sql
    });

    // Handle MySQL specific database errors gracefully
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry: A record with this information already exists.',
            error: process.env.NODE_ENV === 'development' ? err.sqlMessage : undefined
        });
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
            success: false,
            message: 'Relational integrity violation: Referenced key does not exist or has active dependencies.',
            error: process.env.NODE_ENV === 'development' ? err.sqlMessage : undefined
        });
    }

    if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        return res.status(400).json({
            success: false,
            message: 'Check constraint violation: Submitted data does not meet schema business rules.',
            error: process.env.NODE_ENV === 'development' ? err.sqlMessage : undefined
        });
    }

    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message || 'An unexpected internal server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;

