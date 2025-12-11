const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { createSendToken, signRefreshToken } = require('../utils/tokenUtils');
const emailService = require('../services/emailService');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already registered', 400));
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name);

    // Send token response
    createSendToken(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // Send token response
    createSendToken(user, 200, res);
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('wishlist');

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
    // Fields that can be updated
    const { name, email, addresses } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already in use', 400));
        }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { name, email, addresses },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new AppError('Please provide current and new password', 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
        return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send new token
    createSendToken(user, 200, res);
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    // Get user
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('No user found with that email', 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send email with reset token
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetURL);

    res.status(200).json({
        status: 'success',
        message: 'Password reset token sent to email',
        // For development only - remove in production
        ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send new token
    createSendToken(user, 200, res);
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError('User no longer exists', 401));
    }

    // Send new token
    createSendToken(user, 200, res);
});
