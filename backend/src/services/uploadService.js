const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'zeene/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Only image files are allowed', 400), false);
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

/**
 * Upload single image
 */
exports.uploadSingle = upload.single('image');

/**
 * Upload multiple images (max 5)
 */
exports.uploadMultiple = upload.array('images', 5);

/**
 * Delete image from Cloudinary
 */
exports.deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};

/**
 * Delete multiple images from Cloudinary
 */
exports.deleteImages = async (publicIds) => {
    try {
        await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
        console.error('Error deleting images from Cloudinary:', error);
    }
};
