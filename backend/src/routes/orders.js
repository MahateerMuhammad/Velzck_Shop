const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// User routes
router.use(protect);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;
