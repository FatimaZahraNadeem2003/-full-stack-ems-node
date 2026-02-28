const { UnauthenticatedError } = require('../errors');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    // Check for token in headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthenticatedError("Authentication invalid - No token provided");
    }
    
    const token = authHeader.split(" ")[1];

    try {
        // Verify token
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user to request
        req.user = { 
            userId: payload.userId, 
            firstName: payload.firstName, 
            lastName: payload.lastName, 
            email: payload.email, 
            role: payload.role 
        };
        
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            throw new UnauthenticatedError("Authentication invalid - Token expired");
        }
        if (error.name === 'JsonWebTokenError') {
            throw new UnauthenticatedError("Authentication invalid - Invalid token");
        }
        throw new UnauthenticatedError("Authentication invalid");
    }
};

module.exports = authMiddleware;