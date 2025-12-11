const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Protect routes - Verify JWT token
 */
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in. Please log in to access this resource', 401));
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id).select('+isActive');
    if (!user) {
        return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    // 4) Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please log in again', 401));
    }

    // Grant access to protected route
    req.user = user;
    next();
});

/**
 * Restrict routes to specific roles
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

/**
 * Optional authentication - Attach user if token exists
 */
exports.optionalAuth = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (token) {
        try {
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user) {
                req.user = user;
            }
        } catch (err) {
            // Token invalid, continue without user
        }
    }

    next();
});
