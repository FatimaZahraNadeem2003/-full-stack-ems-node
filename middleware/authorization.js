const { UnauthenticatedError, UnauthorizedError } = require("../errors");

/**
 * Generic authorize middleware that checks if user has one of the allowed roles
 * @param  {...string} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new UnauthenticatedError("Authentication required");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new UnauthorizedError(
                `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
            );
        }
        
        next();
    };
};

/**
 * Admin only middleware
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError("Authentication required");
    }

    if (req.user.role !== 'admin') {
        throw new UnauthorizedError("Access denied. Admin access required");
    }
    
    next();
};

/**
 * Teacher middleware (admins also have access)
 */
const teacherMiddleware = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError("Authentication required");
    }

    if (!['admin', 'teacher'].includes(req.user.role)) {
        throw new UnauthorizedError("Access denied. Teacher access required");
    }
    
    next();
};

/**
 * Student middleware (admins also have access)
 */
const studentMiddleware = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError("Authentication required");
    }

    if (!['admin', 'student'].includes(req.user.role)) {
        throw new UnauthorizedError("Access denied. Student access required");
    }
    
    next();
};

/**
 * Check if user owns the resource or is admin
 */
const authorizeOwnerOrAdmin = (getResourceOwnerId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new UnauthenticatedError("Authentication required");
            }

            if (req.user.role === 'admin') {
                return next();
            }

            const ownerId = await getResourceOwnerId(req);
            
            if (req.user.userId !== ownerId.toString()) {
                throw new UnauthorizedError("Access denied. You don't own this resource");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    authorize,
    adminMiddleware,
    teacherMiddleware,
    studentMiddleware,
    authorizeOwnerOrAdmin
};