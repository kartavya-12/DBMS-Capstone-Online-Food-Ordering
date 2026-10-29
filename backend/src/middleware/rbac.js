/**
 * Role-Based Access Control (RBAC) Guard
 * Restricts endpoint execution to specified user roles.
 * Must be mounted AFTER authenticate middleware.
 *
 * @param  {...string} allowedRoles Roles permitted to access the route ('admin', 'customer', 'restaurant_manager')
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required prior to authorization check.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource.`
            });
        }

        next();
    };
};

module.exports = {
    authorize
};

