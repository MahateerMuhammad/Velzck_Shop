const Product = require('../models/Product');
const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { deleteImages } = require('../services/uploadService');

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = catchAsync(async (req, res, next) => {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Search
    if (req.query.search) {
        query = query.find({ $text: { $search: req.query.search } });
    }

    // Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Populate category
    query = query.populate('category', 'name slug');

    // Execute query
    const products = await query;
    const total = await Product.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
        status: 'success',
        results: products.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: {
            products
        }
    });
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
    const products = await Product.find({ featured: true })
        .populate('category', 'name slug')
        .limit(12)
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });
});

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('reviews.user', 'name');

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

/**
 * @desc    Get product by slug
 * @route   GET /api/products/slug/:slug
 * @access  Public
 */
exports.getProductBySlug = catchAsync(async (req, res, next) => {
    const product = await Product.findOne({ slug: req.params.slug })
        .populate('category', 'name slug')
        .populate('reviews.user', 'name');

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = catchAsync(async (req, res, next) => {
    const { name, description, price, compareAtPrice, category, brand, sizes, featured, tags } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        return next(new AppError('Category not found', 404));
    }

    // Handle uploaded images
    const images = req.files ? req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        alt: name,
        isPrimary: false
    })) : [];

    if (images.length > 0) {
        images[0].isPrimary = true;
    }

    const product = await Product.create({
        name,
        description,
        price,
        compareAtPrice,
        category,
        brand,
        images,
        sizes: JSON.parse(sizes || '[]'),
        featured: featured === 'true',
        tags: tags ? JSON.parse(tags) : []
    });

    res.status(201).json({
        status: 'success',
        data: {
            product
        }
    });
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = catchAsync(async (req, res, next) => {
    const { name, description, price, compareAtPrice, category, brand, sizes, featured, tags } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Verify category if being updated
    if (category && category !== product.category.toString()) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return next(new AppError('Category not found', 404));
        }
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => ({
            url: file.path,
            publicId: file.filename,
            alt: name || product.name,
            isPrimary: false
        }));
        product.images.push(...newImages);
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (sizes) product.sizes = JSON.parse(sizes);
    if (featured !== undefined) product.featured = featured === 'true';
    if (tags) product.tags = JSON.parse(tags);

    await product.save();

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

/**
 * @desc    Delete product image
 * @route   DELETE /api/products/:id/images/:imageId
 * @access  Private/Admin
 */
exports.deleteProductImage = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const image = product.images.id(req.params.imageId);
    if (!image) {
        return next(new AppError('Image not found', 404));
    }

    // Delete from Cloudinary
    if (image.publicId) {
        await deleteImages([image.publicId]);
    }

    // Remove from product
    product.images.pull(req.params.imageId);
    await product.save();

    res.status(200).json({
        status: 'success',
        message: 'Image deleted successfully'
    });
});

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    product.isDeleted = true;
    product.isActive = false;
    await product.save();

    res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully'
    });
});

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:categorySlug
 * @access  Public
 */
exports.getProductsByCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findOne({ slug: req.params.categorySlug });
    if (!category) {
        return next(new AppError('Category not found', 404));
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find({ category: category._id })
        .populate('category', 'name slug')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt');

    const total = await Product.countDocuments({ category: category._id });

    res.status(200).json({
        status: 'success',
        results: products.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: {
            products
        }
    });
});

/**
 * @desc    Add product review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
exports.addReview = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
        review => review.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
        return next(new AppError('You have already reviewed this product', 400));
    }

    // Add review
    product.reviews.push({
        user: req.user.id,
        rating,
        comment
    });

    await product.save();

    // Recalculate average rating
    await Product.calcAverageRatings(product._id);

    res.status(201).json({
        status: 'success',
        message: 'Review added successfully'
    });
});
