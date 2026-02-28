const { UnauthenticatedError, UnauthorizedError } = require("../errors");

/**
@param  {...string} allowedRoles 
@returns {Function} 
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
const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError("Authentication required");
    }

    if (req.user.role !== 'admin') {
        throw new UnauthorizedError("Access denied. Admin access required");
    }
    
    next();
};

/**
 * Teacher only middleware (admins also have access)
 */
const authorizeTeacher = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError("Authentication required");
    }

    if (!['admin', 'teacher'].includes(req.user.role)) {
        throw new UnauthorizedError("Access denied. Teacher access required");
    }
    
    next();
};

/**
 * Student only middleware (admins also have access)
 */
const authorizeStudent = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError("Authentication required");
    }

    if (!['admin', 'student'].includes(req.user.role)) {
        throw new UnauthorizedError("Access denied. Student access required");
    }
    
    next();
};

/**
 @param {Function} getResourceOwnerId 
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
    authorizeAdmin,
    authorizeTeacher,
    authorizeStudent,
    authorizeOwnerOrAdmin
};