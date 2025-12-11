const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadSingle } = require('../services/uploadService');

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategory);

// Admin routes
router.use(protect, restrictTo('admin'));

router.post('/', uploadSingle, categoryController.createCategory);
router.put('/:id', uploadSingle, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
