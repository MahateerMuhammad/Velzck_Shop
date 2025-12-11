const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    image: {
        url: String,
        publicId: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
// Indexes
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1, order: 1 });

// Virtual: Subcategories
categorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Pre-save: Generate slug
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Query middleware: Only active categories
categorySchema.pre(/^find/, function (next) {
    this.find({ isActive: { $ne: false } });
    next();
});

module.exports = mongoose.model('Category', categorySchema);
