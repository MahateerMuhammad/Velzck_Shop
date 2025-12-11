require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const User = require('../src/models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const categories = [
    { name: 'Shoes', description: 'Premium footwear collection including sneakers, boots, and casual shoes' },
    { name: 'Clothing', description: 'Trendy apparel and fashion items' },
    { name: 'Accessories', description: 'Complete your look with our accessories' },
    { name: 'Sportswear', description: 'Athletic and performance wear' }
];

// Cloudinary URL Map for production-ready images
const cloudinaryMap = {
    "/imgs/1.1.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468407/zeene/products/1.1.webp",
    "/imgs/1.2.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468408/zeene/products/1.2.webp",
    "/imgs/1.3.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468411/zeene/products/1.3.webp",
    "/imgs/1.4.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468412/zeene/products/1.4.webp",
    "/imgs/2.3.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468413/zeene/products/2.3.webp",
    "/imgs/2.6.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468414/zeene/products/2.6.webp",
    "/imgs/2.4.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468416/zeene/products/2.4.webp",
    "/imgs/2.2.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468417/zeene/products/2.2.webp",
    "/imgs/1.8.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468418/zeene/products/1.8.webp",
    "/imgs/2.5.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468419/zeene/products/2.5.webp",
    "/imgs/1.9.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468419/zeene/products/1.9.webp",
    "/imgs/2.7.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468420/zeene/products/2.7.webp",
    "/imgs/2.8.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468422/zeene/products/2.8.webp",
    "/imgs/1.7.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468423/zeene/products/1.7.webp",
    "/imgs/1.5.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468424/zeene/products/1.5.webp",
    "/imgs/1.6.webp": "https://res.cloudinary.com/ddppfyrcv/image/upload/v1765468424/zeene/products/1.6.webp"
};

const products = [
    {
        name: "Mike Air Grey",
        brand: "Mike", // Changed from Jordan to match original template text
        description: "Classic grey colorway Air Max with premium cushioning. Features breathable mesh upper and durable rubber outsole for all-day comfort.",
        price: 129.99,
        compareAtPrice: 159.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/1.1.webp"],
        tags: ["air-max", "grey", "classic"],
        featured: true
    },
    {
        name: "Mike High Red",
        brand: "Mike",
        description: "High-top design in striking red. Iconic silhouette with modern comfort upgrades. Perfect for street style and performance.",
        price: 149.99,
        compareAtPrice: 189.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/1.2.webp"],
        tags: ["jordan", "red", "high-top"],
        featured: true
    },
    {
        name: "Mike Zoom Black",
        brand: "Mike",
        description: "Sleek black Zoom edition for ultimate speed. Responsive cushioning technology meets minimalist design.",
        price: 139.99,
        compareAtPrice: null,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/1.3.webp"],
        tags: ["zoom", "black", "performance"],
        featured: true
    },
    {
        name: "Mike Air Blue",
        brand: "Mike",
        description: "Vibrant blue Air Max delivering style and substance. Lightweight construction with maximum impact protection.",
        price: 119.99,
        compareAtPrice: 149.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/1.4.webp"],
        tags: ["air-max", "blue", "running"],
        featured: true
    },
    {
        name: "Mike Fontanka",
        brand: "Mike",
        description: "Fontanka edition with deconstructed aesthetic. Layered design with soft foam midsole for a unique look and feel.",
        price: 129.99,
        compareAtPrice: 159.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/2.3.webp"],
        tags: ["fontanka", "air-force", "fashion"],
        featured: true
    },
    {
        name: "Mike Low Black",
        brand: "Mike",
        description: "Essential low-top in triple black. Timeless versatility matching any outfit. Durable leather construction.",
        price: 99.99,
        compareAtPrice: 119.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/2.6.webp"],
        tags: ["air-force", "low", "black"],
        featured: true
    },
    {
        name: "Mike Wmns",
        brand: "Mike",
        description: "Women's exclusive colorway. Elegant design with female-specific fit. Soft pastel tones with premium materials.",
        price: 139.99,
        compareAtPrice: null,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/2.4.webp"],
        tags: ["womens", "air-max", "pastel"],
        featured: true
    },
    {
        name: "Mike Mid Smoke",
        brand: "Mike",
        description: "Mid-top silhouette in smoke grey. The perfect balance between high-top support and low-top freedom.",
        price: 119.99,
        compareAtPrice: 139.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/2.2.webp"],
        tags: ["mid", "smoke", "jordan"],
        featured: true
    },
    {
        name: "Retro High Tie Dye",
        brand: "Mike",
        description: "Artistic tie-dye print on classic high-top. Each pair is unique. Statement piece for bold styles.",
        price: 169.99,
        compareAtPrice: null,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/1.8.webp"],
        tags: ["tie-dye", "retro", "high-top"],
        featured: true
    },
    {
        name: "Mike Low Raygun",
        brand: "Mike",
        description: "Raygun inspired colorway. Alien mascot details with vibrant orange and yellow accents. Sci-fi meets street.",
        price: 129.99,
        compareAtPrice: 159.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/2.5.webp"],
        tags: ["raygun", "low", "theme"],
        featured: true
    },
    {
        name: "Mike Mid Satin Grey",
        brand: "Mike",
        description: "Luxurious satin finish in grey. Premium touch to a classic model. Smooth texture and refined look.",
        price: 139.99,
        compareAtPrice: 169.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/1.9.webp"],
        tags: ["satin", "mid", "grey"],
        featured: true
    },
    {
        name: "Mike Low White",
        brand: "Mike",
        description: "Crisp white low-tops. The ultimate clean sneaker. fresh, simple, and essential for every rotation.",
        price: 99.99,
        compareAtPrice: null,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/2.7.webp"],
        tags: ["white", "low", "classic"],
        featured: true
    },
    {
        name: "Nike Platinum",
        brand: "Nike",
        description: "Platinum colorway Air Max 270 with modern design. Maximum cushioning and sleek aesthetics. Ultimate comfort technology.",
        price: 159.99,
        compareAtPrice: 199.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/2.8.webp"],
        tags: ["air-max", "platinum", "modern"],
        featured: true
    },
    {
        name: "Nike Champagne",
        brand: "Nike",
        description: "Elegant champagne Air Max 95 with premium finish. Sophisticated colorway for special occasions. Luxury meets comfort.",
        price: 149.99,
        compareAtPrice: 189.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/1.7.webp"],
        tags: ["air-max", "champagne", "elegant"],
        featured: true
    },
    {
        name: "Nike Valentine",
        brand: "Nike",
        description: "Special Valentine edition Air Force 1. Limited release with unique colorway. Romantic design perfect for gifting.",
        price: 109.99,
        compareAtPrice: 139.99,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/1.5.webp"],
        tags: ["air-force", "valentine", "limited"],
        featured: true
    },
    {
        name: "Nike Dark Beetroot",
        brand: "Nike",
        description: "Rich dark beetroot colorway. Deep tones for a sophisticated autumn look. Premium leather construction.",
        price: 119.99,
        compareAtPrice: null,
        categoryName: "Shoes",
        image: cloudinaryMap["/imgs/1.6.webp"],
        tags: ["beetroot", "dark", "autumn"],
        featured: true
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Product.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({});

        // Create admin user
        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@zeene.com',
            password: 'Admin123!',
            role: 'admin'
        });
        console.log('✅ Admin created:', admin.email);

        // Create categories
        console.log('📁 Creating categories...');
        const createdCategories = [];
        for (const cat of categories) {
            const category = await Category.create(cat);
            createdCategories.push(category);
        }
        console.log(`✅ Created ${createdCategories.length} categories`);

        // Create category map
        const categoryMap = {};
        createdCategories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });

        // Create products with category references
        console.log('🛍️  Creating products...');
        const createdProducts = [];
        for (const p of products) {
            // Updated image structure processing
            let imageData = [];
            if (p.image) {
                imageData = [{ url: p.image, alt: p.name, isPrimary: true }];
            } else if (p.images && p.images.length > 0) {
                // For existing structure if mixed
                imageData = p.images;
            }

            const product = await Product.create({
                ...p,
                category: categoryMap[p.categoryName],
                images: imageData
            });
            createdProducts.push(product);
        }
        console.log(`✅ Created ${createdProducts.length} products`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Categories: ${createdCategories.length}`);
        console.log(`   - Products: ${createdProducts.length}`);
        console.log(`   - Admin: ${admin.email} / Admin123!`);
        console.log('\n✨ You can now start the server and test the API!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
