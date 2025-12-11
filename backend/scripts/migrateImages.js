import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local image paths from the original seed script
const localImages = [
    '/imgs/1.1.webp', '/imgs/1.2.webp', '/imgs/1.3.webp', '/imgs/1.4.webp',
    '/imgs/2.3.webp', '/imgs/2.6.webp', '/imgs/2.4.webp', '/imgs/2.2.webp',
    '/imgs/1.8.webp', '/imgs/2.5.webp', '/imgs/1.9.webp', '/imgs/2.7.webp',
    '/imgs/2.8.webp', '/imgs/1.7.webp', '/imgs/1.5.webp', '/imgs/1.6.webp'
];

const uploadImages = async () => {
    console.log('Starting migration of local images to Cloudinary...');
    const urlMap = {};

    for (const imagePath of localImages) {
        try {
            // Images are in the project root 'imgs' folder
            const absolutePath = path.resolve(__dirname, '../../imgs', path.basename(imagePath));

            // Check if file exists, log specific error if not
            if (!fs.existsSync(absolutePath)) {
                // Try alternate path checking frontend/public/imgs
                const altPath = path.resolve(__dirname, '../../frontend/public/imgs', path.basename(imagePath));
                if (fs.existsSync(altPath)) {
                    // Found in frontend/public/imgs
                    console.log(`Found image at: ${altPath}`);
                    console.log(`Uploading ${path.basename(imagePath)}...`);
                    const result = await cloudinary.uploader.upload(altPath, {
                        folder: 'zeene/products',
                        use_filename: true,
                        unique_filename: false,
                    });
                    urlMap[imagePath] = result.secure_url;
                    console.log(`Uploaded: ${result.secure_url}`);
                    continue;
                }

                console.error(`File not found at ${absolutePath} or ${altPath}`);
                continue;
            }

            console.log(`Found image at: ${absolutePath}`);
            console.log(`Uploading ${path.basename(imagePath)}...`);
            const result = await cloudinary.uploader.upload(absolutePath, {
                folder: 'zeene/products',
                use_filename: true,
                unique_filename: false,
            });

            urlMap[imagePath] = result.secure_url;
            console.log(`Uploaded: ${result.secure_url}`);
        } catch (error) {
            console.error(`Failed to upload ${imagePath}:`, error.message);
        }
    }

    console.log('\nMigration Complete. URL Mapping:');
    console.log(JSON.stringify(urlMap, null, 2));

    // Save map to a file for use in seed script
    fs.writeFileSync(
        path.join(__dirname, 'image-map.json'),
        JSON.stringify(urlMap, null, 2)
    );
};

uploadImages();
