/**
 * Wrapper for async route handlers to catch errors
 * Eliminates try-catch blocks in controllers
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync;
