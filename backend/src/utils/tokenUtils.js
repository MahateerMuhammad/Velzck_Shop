const jwt = require('jsonwebtoken');

/**
 * Sign JWT token
 */
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

/**
 * Sign refresh token
 */
const signRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE
    });
};

/**
 * Create and send token response
 */
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    // Send cookie
    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        refreshToken,
        data: {
            user
        }
    });
};

module.exports = {
    signToken,
    signRefreshToken,
    createSendToken
};
