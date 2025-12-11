const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
