const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            image: String,
            sku: String
        },
        size: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        addressLine1: {
            type: String,
            required: true
        },
        addressLine2: String,
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    billingAddress: {
        fullName: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        phone: String
    },
    payment: {
        method: {
            type: String,
            enum: ['card', 'paypal', 'cod'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        paidAt: Date
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
        index: true
    },
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    totals: {
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        tax: {
            type: Number,
            default: 0,
            min: 0
        },
        shipping: {
            type: Number,
            default: 0,
            min: 0
        },
        discount: {
            type: Number,
            default: 0,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    coupon: {
        code: String,
        discount: Number
    },
    tracking: {
        carrier: String,
        trackingNumber: String,
        trackingUrl: String,
        shippedAt: Date,
        deliveredAt: Date
    },
    notes: {
        type: String,
        maxlength: 500
    },
    cancelledAt: Date,
    cancellationReason: String
}, {
    timestamps: true
});

// Indexes for performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save: Generate order number
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        // Find the count of orders today
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const count = await this.constructor.countDocuments({
            createdAt: { $gte: startOfDay }
        });

        const sequence = (count + 1).toString().padStart(4, '0');
        this.orderNumber = `ZN${year}${month}${day}${sequence}`;
    }
    next();
});

// Pre-save: Add status to history
orderSchema.pre('save', function (next) {
    if (this.isModified('status') && !this.isNew) {
        this.statusHistory.push({
            status: this.status,
            updatedAt: new Date()
        });
    }
    next();
});

// Instance method: Can be cancelled
orderSchema.methods.canBeCancelled = function () {
    return ['pending', 'confirmed'].includes(this.status);
};

// Instance method: Cancel order
orderSchema.methods.cancelOrder = function (reason) {
    if (!this.canBeCancelled()) {
        throw new Error('Order cannot be cancelled at this stage');
    }
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
};

// Static method: Get order statistics
orderSchema.statics.getStats = async function (startDate, endDate) {
    return await this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totals.total' },
                averageOrderValue: { $avg: '$totals.total' }
            }
        }
    ]);
};

module.exports = mongoose.model('Order', orderSchema);
