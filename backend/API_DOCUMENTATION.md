# Zeene API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.new@example.com"
}
```

### Change Password
```http
PUT /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

---

## Product Endpoints

### Get All Products
```http
GET /products?page=1&limit=20&sort=-createdAt&search=nike&price[gte]=50&price[lte]=200
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort field (prefix with - for descending)
- `search`: Full-text search
- `price[gte]`, `price[lte]`: Price range
- `category`: Category ID

### Get Featured Products
```http
GET /products/featured
```

### Get Product by ID
```http
GET /products/:id
```

### Get Product by Slug
```http
GET /products/slug/:slug
```

### Get Products by Category
```http
GET /products/category/:categorySlug?page=1&limit=20
```

### Create Product (Admin)
```http
POST /products
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Nike Air Max",
  "description": "Premium sneakers",
  "price": 129.99,
  "compareAtPrice": 159.99,
  "category": "category_id",
  "brand": "Nike",
  "sizes": "[{\"size\":\"8\",\"stock\":10,\"sku\":\"NAM-8\"}]",
  "featured": "true",
  "tags": "[\"nike\",\"air-max\"]",
  "images": [<file>, <file>]
}
```

### Update Product (Admin)
```http
PUT /products/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Delete Product (Admin)
```http
DELETE /products/:id
Authorization: Bearer <admin_token>
```

### Add Product Review
```http
POST /products/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great product!"
}
```

---

## Category Endpoints

### Get All Categories
```http
GET /categories
```

### Get Category by Slug
```http
GET /categories/:slug
```

### Create Category (Admin)
```http
POST /categories
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Jordan 1",
  "description": "Classic Air Jordan 1 sneakers",
  "order": 1,
  "image": <file>
}
```

---

## Cart Endpoints

### Get Cart
```http
GET /cart
Authorization: Bearer <token>
```

### Add to Cart
```http
POST /cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "size": "9",
  "quantity": 1
}
```

### Update Cart Item
```http
PUT /cart/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 2
}
```

### Remove from Cart
```http
DELETE /cart/:itemId
Authorization: Bearer <token>
```

### Clear Cart
```http
DELETE /cart
Authorization: Bearer <token>
```

---

## Order Endpoints

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "fullName": "John Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "cod",
  "notes": "Please deliver after 5 PM"
}
```

### Get User Orders
```http
GET /orders?page=1&limit=10
Authorization: Bearer <token>
```

### Get Order Details
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Cancel Order
```http
PUT /orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

---

## Admin Endpoints

### Get All Orders
```http
GET /admin/orders?page=1&limit=20&status=pending
Authorization: Bearer <admin_token>
```

### Update Order Status
```http
PUT /admin/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "note": "Order shipped via FedEx",
  "trackingNumber": "1234567890",
  "trackingCarrier": "FedEx"
}
```

**Status Values:**
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

### Get Order Statistics
```http
GET /admin/orders/stats?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>
```

---

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    "user": { ... }
  }
}
```

### Error Response
```json
{
  "status": "fail",
  "message": "Error message here"
}
```

### Paginated Response
```json
{
  "status": "success",
  "results": 20,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "data": {
    "products": [ ... ]
  }
}
```

---

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

---

## Admin Credentials (Development)

After running the seed script:
```
Email: admin@zeene.com
Password: Admin123!
```
