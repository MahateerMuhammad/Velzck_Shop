# Zeene Backend - README

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── scripts/             # Database scripts
├── server.js            # Entry point
└── package.json
```

## 🔐 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js security headers
- ✅ MongoDB injection prevention
- ✅ XSS protection
- ✅ HPP (HTTP Parameter Pollution) prevention
- ✅ CORS configuration

## 📊 Database Models

- **User**: Authentication and profile
- **Product**: Product catalog with variants
- **Category**: Product categories
- **Cart**: Shopping cart with TTL
- **Order**: Order management with tracking

## 🛠️ API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Reference
- `/api/auth/*` - Authentication
- `/api/products/*` - Products
- `/api/categories/*` - Categories
- `/api/cart/*` - Shopping cart
- `/api/orders/*` - Orders
- `/api/admin/*` - Admin operations

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

Required variables in `.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

### Environment Setup

- Set `NODE_ENV=production`
- Configure MongoDB Atlas IP whitelist
- Set strong JWT secrets
- Configure CORS for production domain

## 📈 Performance

- Database indexing on frequently queried fields
- Pagination for large datasets
- Image optimization via Cloudinary
- Compression middleware
- Connection pooling

## 🔄 Development Workflow

```bash
# Start dev server with auto-reload
npm run dev

# Seed database
npm run seed

# Run linter
npm run lint
```

## 📚 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT
- **File Upload**: Cloudinary
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limit

## 👥 Admin Access

Default admin credentials (after seeding):
```
Email: admin@zeene.com
Password: Admin123!
```

**⚠️ Change these in production!**

## 📄 License

MIT
