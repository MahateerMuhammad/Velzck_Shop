const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    compareAtPrice: {
        type: Number,
        min: [0, 'Compare price cannot be negative'],
        validate: {
            validator: function (val) {
                return !val || val > this.price;
            },
            message: 'Compare price must be greater than regular price'
        }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product must belong to a category']
    },
    brand: {
        type: String,
        default: 'Nike',
        trim: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: String, // Cloudinary public ID for deletion
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    sizes: [{
        size: {
            type: String,
            required: true,
            trim: true
        },
        stock: {
            type: Number,
            required: true,
            min: [0, 'Stock cannot be negative'],
            default: 0
        },
        sku: {
            type: String,
            unique: true,
            sparse: true
        }
    }],
    featured: {
        type: Boolean,
        default: false,
        index: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot be more than 5'],
            set: val => Math.round(val * 10) / 10 // Round to 1 decimal
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: [500, 'Review cannot exceed 500 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
productSchema.index({ name: 'text', description: 'text' }); // Full-text search
productSchema.index({ category: 1, featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });

// Virtual: Total stock across all sizes
productSchema.virtual('totalStock').get(function () {
    return this.sizes.reduce((total, size) => total + size.stock, 0);
});

// Virtual: Discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

// Pre-save: Generate slug from name
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Pre-save: Ensure only one primary image
productSchema.pre('save', function (next) {
    if (this.images && this.images.length > 0) {
        const primaryCount = this.images.filter(img => img.isPrimary).length;
        if (primaryCount === 0) {
            this.images[0].isPrimary = true;
        } else if (primaryCount > 1) {
            // Keep only the first primary image
            let foundPrimary = false;
            this.images.forEach(img => {
                if (img.isPrimary && !foundPrimary) {
                    foundPrimary = true;
                } else {
                    img.isPrimary = false;
                }
            });
        }
    }
    next();
});

// Query middleware: Exclude deleted products
productSchema.pre(/^find/, function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});

// Static method: Calculate average rating
productSchema.statics.calcAverageRatings = async function (productId) {
    const stats = await this.aggregate([
        { $match: { _id: productId } },
        { $unwind: '$reviews' },
        {
            $group: {
                _id: '$_id',
                avgRating: { $avg: '$reviews.rating' },
                numRatings: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await this.findByIdAndUpdate(productId, {
            'ratings.average': stats[0].avgRating,
            'ratings.count': stats[0].numRatings
        });
    } else {
        await this.findByIdAndUpdate(productId, {
            'ratings.average': 0,
            'ratings.count': 0
        });
    }
};

module.exports = mongoose.model('Product', productSchema);
