const { UnauthenticatedError, UnauthorizedError } = require("../errors");

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


const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError("Authentication required");
    }

    if (req.user.role !== 'admin') {
        throw new UnauthorizedError("Access denied. Admin access required");
    }
    
    next();
};

const teacherMiddleware = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError("Authentication required");
    }

    if (!['admin', 'teacher'].includes(req.user.role)) {
        throw new UnauthorizedError("Access denied. Teacher access required");
    }
    
    next();
};


const studentMiddleware = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError("Authentication required");
    }

    if (!['admin', 'student'].includes(req.user.role)) {
        throw new UnauthorizedError("Access denied. Student access required");
    }
    
    next();
};


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