const Category = require('../models/Category');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { deleteImages } = require('../services/uploadService');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find()
        .populate('subcategories')
        .sort('order name');

    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: {
            categories
        }
    });
});

/**
 * @desc    Get single category
 * @route   GET /api/categories/:slug
 * @access  Public
 */
exports.getCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findOne({ slug: req.params.slug })
        .populate('subcategories');

    if (!category) {
        return next(new AppError('Category not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            category
        }
    });
});

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
exports.createCategory = catchAsync(async (req, res, next) => {
    const { name, description, parent, order } = req.body;

    // Handle uploaded image
    let image = null;
    if (req.file) {
        image = {
            url: req.file.path,
            publicId: req.file.filename
        };
    }

    const category = await Category.create({
        name,
        description,
        parent: parent || null,
        image,
        order
    });

    res.status(201).json({
        status: 'success',
        data: {
            category
        }
    });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = catchAsync(async (req, res, next) => {
    const { name, description, parent, order, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new AppError('Category not found', 404));
    }

    // Handle new uploaded image
    if (req.file) {
        // Delete old image if exists
        if (category.image && category.image.publicId) {
            await deleteImages([category.image.publicId]);
        }
        category.image = {
            url: req.file.path,
            publicId: req.file.filename
        };
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (parent !== undefined) category.parent = parent || null;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
        status: 'success',
        data: {
            category
        }
    });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new AppError('Category not found', 404));
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
        return next(new AppError('Cannot delete category with existing products', 400));
    }

    // Delete image from Cloudinary
    if (category.image && category.image.publicId) {
        await deleteImages([category.image.publicId]);
    }

    await category.deleteOne();

    res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully'
    });
});
