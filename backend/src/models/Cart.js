const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true
    },
    sessionId: {
        type: String,
        sparse: true,
        index: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        size: {
            type: String,
            required: [true, 'Size is required']
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
            max: [10, 'Cannot add more than 10 items']
        },
        priceSnapshot: {
            type: Number,
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        index: { expires: 0 } // TTL index
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});



// Virtual: Subtotal
cartSchema.virtual('subtotal').get(function () {
    return this.items.reduce((total, item) => {
        return total + (item.priceSnapshot * item.quantity);
    }, 0);
});

// Virtual: Total items
cartSchema.virtual('totalItems').get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Instance method: Add item to cart
cartSchema.methods.addItem = function (productId, size, quantity, price) {
    const existingItemIndex = this.items.findIndex(
        item => item.product.toString() === productId.toString() && item.size === size
    );

    if (existingItemIndex > -1) {
        // Update quantity if item exists
        this.items[existingItemIndex].quantity += quantity;
        if (this.items[existingItemIndex].quantity > 10) {
            this.items[existingItemIndex].quantity = 10;
        }
    } else {
        // Add new item
        this.items.push({
            product: productId,
            size,
            quantity,
            priceSnapshot: price
        });
    }
};

// Instance method: Remove item from cart
cartSchema.methods.removeItem = function (itemId) {
    this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
};

// Instance method: Update item quantity
cartSchema.methods.updateItemQuantity = function (itemId, quantity) {
    const item = this.items.find(item => item._id.toString() === itemId.toString());
    if (item) {
        item.quantity = Math.min(Math.max(quantity, 1), 10);
    }
};

// Instance method: Clear cart
cartSchema.methods.clearCart = function () {
    this.items = [];
};

module.exports = mongoose.model('Cart', cartSchema);
