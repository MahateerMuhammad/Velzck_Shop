const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadMultiple } = require('../services/uploadService');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:categorySlug', productController.getProductsByCategory);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProduct);

// Protected routes
router.post('/:id/reviews', protect, productController.addReview);

// Admin routes
router.use(protect, restrictTo('admin')); // All routes after this require admin role

router.post('/', uploadMultiple, productController.createProduct);
router.put('/:id', uploadMultiple, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.delete('/:id/images/:imageId', productController.deleteProductImage);

module.exports = router;
