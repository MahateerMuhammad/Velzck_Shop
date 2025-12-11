const Cart = require('../models/Cart');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Get user cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = catchAsync(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id })
        .populate('items.product', 'name slug price images sizes');

    if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
exports.addToCart = catchAsync(async (req, res, next) => {
    const { productId, size, quantity = 1 } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Validate size and stock
    const sizeOption = product.sizes.find(s => s.size === size);
    if (!sizeOption) {
        return next(new AppError('Size not available', 400));
    }

    if (sizeOption.stock < quantity) {
        return next(new AppError(`Only ${sizeOption.stock} items available in stock`, 400));
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Add item to cart
    cart.addItem(productId, size, quantity, product.price);
    await cart.save();

    // Populate and return
    await cart.populate('items.product', 'name slug price images sizes');

    res.status(200).json({
        status: 'success',
        message: 'Item added to cart',
        data: {
            cart
        }
    });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
exports.updateCartItem = catchAsync(async (req, res, next) => {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return next(new AppError('Quantity must be at least 1', 400));
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
        return next(new AppError('Item not found in cart', 404));
    }

    // Check stock availability
    const product = await Product.findById(item.product);
    const sizeOption = product.sizes.find(s => s.size === item.size);

    if (sizeOption.stock < quantity) {
        return next(new AppError(`Only ${sizeOption.stock} items available in stock`, 400));
    }

    cart.updateItemQuantity(req.params.itemId, quantity);
    await cart.save();

    await cart.populate('items.product', 'name slug price images sizes');

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
exports.removeFromCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    cart.removeItem(req.params.itemId);
    await cart.save();

    await cart.populate('items.product', 'name slug price images sizes');

    res.status(200).json({
        status: 'success',
        message: 'Item removed from cart',
        data: {
            cart
        }
    });
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
exports.clearCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    cart.clearCart();
    await cart.save();

    res.status(200).json({
        status: 'success',
        message: 'Cart cleared',
        data: {
            cart
        }
    });
});
