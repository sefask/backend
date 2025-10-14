const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({
                errors: [{ field: "auth", message: "Access denied. No token provided." }]
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get full user data
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                errors: [{ field: "auth", message: "Invalid token. User not found." }]
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                errors: [{ field: "auth", message: "Invalid token." }]
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                errors: [{ field: "auth", message: "Token expired." }]
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            errors: [{ field: "auth", message: "Authentication error." }]
        });
    }
};

// Optional auth - doesn't fail if no token, just sets req.user if token exists
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.authToken;

        if (!token) {
            req.user = null;
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get full user data
        const user = await User.findById(decoded.id).select('-password');
        req.user = user || null;

        next();
    } catch (error) {
        // Silent fail for optional auth
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth
};