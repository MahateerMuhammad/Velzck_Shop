const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts, please try again later',
    skipSuccessfulRequests: true,
});

const securityMiddleware = (app) => {
    // Set security HTTP headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));

    // Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Prevent parameter pollution
    app.use(hpp({
        whitelist: ['price', 'category', 'size', 'rating']
    }));

    // Apply rate limiting to all routes
    app.use('/api/', limiter);
};

module.exports = { securityMiddleware, authLimiter };
