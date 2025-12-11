const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    emailValidation,
    resetPasswordValidation,
    updateProfileValidation
} = require('../middleware/validators');

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/forgot-password', authLimiter, emailValidation, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidation, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(protect); // All routes after this are protected

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/profile', updateProfileValidation, authController.updateProfile);
router.put('/change-password', changePasswordValidation, authController.changePassword);

module.exports = router;
