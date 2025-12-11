const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const emailService = require('../services/emailService');

/**
 * @desc    Create order from cart
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = catchAsync(async (req, res, next) => {
    const { shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    // Get user cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        return next(new AppError('Cart is empty', 400));
    }

    // Validate stock and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);

        if (!product) {
            return next(new AppError(`Product ${item.product.name} not found`, 404));
        }

        const sizeOption = product.sizes.find(s => s.size === item.size);
        if (!sizeOption || sizeOption.stock < item.quantity) {
            return next(new AppError(`Insufficient stock for ${product.name} size ${item.size}`, 400));
        }

        // Prepare order item with product snapshot
        orderItems.push({
            product: {
                _id: product._id,
                name: product.name,
                image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url,
                sku: sizeOption.sku
            },
            size: item.size,
            quantity: item.quantity,
            price: product.price, // Use current price
            total: product.price * item.quantity
        });

        // Reduce stock
        sizeOption.stock -= item.quantity;
        await product.save();
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Create order
    const order = await Order.create({
        user: req.user.id,
        items: orderItems,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        payment: {
            method: paymentMethod || 'cod',
            status: paymentMethod === 'cod' ? 'pending' : 'pending'
        },
        totals: {
            subtotal,
            tax,
            shipping,
            discount: 0,
            total
        },
        notes
    });

    // Clear cart
    cart.clearCart();
    await cart.save();

    // Send order confirmation email
    const user = await User.findById(req.user.id);
    await emailService.sendOrderConfirmation(user.email, order);

    res.status(201).json({
        status: 'success',
        message: 'Order created successfully',
        data: {
            order
        }
    });
});

/**
 * @desc    Get user orders
 * @route   GET /api/orders
 * @access  Private
 */
exports.getUserOrders = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments({ user: req.user.id });

    res.status(200).json({
        status: 'success',
        results: orders.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: {
            orders
        }
    });
});

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Ensure user can only access their own orders
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to access this order', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = catchAsync(async (req, res, next) => {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Ensure user can only cancel their own orders
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to cancel this order', 403));
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
        return next(new AppError('Order cannot be cancelled at this stage', 400));
    }

    // Restore stock
    for (const item of order.items) {
        const product = await Product.findById(item.product._id);
        if (product) {
            const sizeOption = product.sizes.find(s => s.size === item.size);
            if (sizeOption) {
                sizeOption.stock += item.quantity;
                await product.save();
            }
        }
    }

    order.cancelOrder(reason || 'Cancelled by user');
    await order.save();

    // TODO: Send cancellation email
    // await emailService.sendOrderCancellation(order.user.email, order);

    res.status(200).json({
        status: 'success',
        message: 'Order cancelled successfully',
        data: {
            order
        }
    });
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
exports.getAllOrders = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (req.query.status) {
        query.status = req.query.status;
    }

    const orders = await Order.find(query)
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
        status: 'success',
        results: orders.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: {
            orders
        }
    });
});

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status, note, trackingNumber, trackingCarrier } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Update status
    order.status = status;

    // Add to status history
    order.statusHistory.push({
        status,
        note,
        updatedBy: req.user.id,
        updatedAt: new Date()
    });

    // Update tracking if provided
    if (trackingNumber) {
        order.tracking.trackingNumber = trackingNumber;
        order.tracking.carrier = trackingCarrier;
        if (status === 'shipped') {
            order.tracking.shippedAt = new Date();
        }
    }

    // Update payment status if delivered
    if (status === 'delivered') {
        order.payment.status = 'completed';
        order.payment.paidAt = new Date();
        order.tracking.deliveredAt = new Date();
    }

    await order.save();

    // TODO: Send status update email
    // await emailService.sendOrderStatusUpdate(order.user.email, order);

    res.status(200).json({
        status: 'success',
        message: 'Order status updated',
        data: {
            order
        }
    });
});

/**
 * @desc    Get order statistics (Admin)
 * @route   GET /api/admin/orders/stats
 * @access  Private/Admin
 */
exports.getOrderStats = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await Order.getStats(start, end);

    const statusCounts = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
            statusCounts
        }
    });
});
