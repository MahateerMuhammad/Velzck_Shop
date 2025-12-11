const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, restrictTo('admin'));

// Order management
router.get('/orders', orderController.getAllOrders);
router.get('/orders/stats', orderController.getOrderStats);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
    // TODO: Implement comprehensive dashboard stats
    res.status(200).json({
        status: 'success',
        message: 'Admin dashboard endpoint - to be implemented'
    });
});

module.exports = router;
