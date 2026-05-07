# XM Bakeries – Stock & Order Management System

A RESTful backend API for XM Bakeries built with **Node.js**, **Express.js**, and **MongoDB**.  
Developed as part of the Codebridge Academy Software Development Internship Program – May 2026.

---

## Features

| Area | Details |
|------|---------|
| **Product Management** | Full CRUD, advanced search by category / price range / quantity, sorting & pagination |
| **Order Management** | Place orders, track status, real-time inventory deduction via MongoDB transactions |
| **Inventory** | Stock auto-updated on every sale; out-of-stock orders are blocked |
| **Reports** | Sales summary, daily revenue, top products, low-stock alerts (MongoDB aggregation) |
| **Customer Management** | Admin can list, view, and update customer details |
| **Authentication** | JWT-based auth with bcrypt password hashing |
| **Authorization** | Role-based access control: `customer`, `manager`, `admin` |
| **Security** | Helmet headers, CORS, input validation (express-validator), request size limit, audit logging |
| **Testing** | 32 unit tests (Jest + Supertest) covering auth, products, orders, and security |

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors
- **Logging**: winston + morgan
- **Testing**: Jest + Supertest
- **Deployment**: Render / Railway

---

## Project Structure

```
xm-bakeries/
├── config/
│   └── db.js                  # MongoDB connection
├── src/
│   ├── app.js                 # Express app (middleware, routes)
│   ├── server.js              # Entry point
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── reportController.js
│   │   └── customerController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reportRoutes.js
│   │   └── customerRoutes.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + authorize
│   │   ├── validate.js        # express-validator rules
│   │   └── errorHandler.js    # Global error handler
│   └── utils/
│       └── logger.js          # Winston logger
└── tests/
    ├── setup.js
    ├── auth.test.js
    ├── product.test.js
    ├── order.test.js
    └── security.test.js
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/xm-bakeries-api.git
cd xm-bakeries-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/xm_bakeries
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Start the server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

### 5. Run tests
```bash
npm test
```

---

## API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login & get JWT token | Public |
| GET | `/api/auth/me` | Get current user | 🔒 Any |
| PUT | `/api/auth/profile` | Update own profile | 🔒 Any |

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products (filter/sort/search) | Public |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products` | Create product | 🔒 Admin/Manager |
| PUT | `/api/products/:id` | Update product | 🔒 Admin/Manager |
| DELETE | `/api/products/:id` | Soft-delete product | 🔒 Admin |

**Query params for GET /api/products:**
- `category` – bread, cake, pastry, cookie, beverage, other
- `minPrice` / `maxPrice` – price range filter
- `minQty` – minimum quantity
- `search` – full-text search on product name
- `sortBy` – price, -price, name, -name, quantity, -quantity, createdAt, -createdAt
- `page` / `limit` – pagination (default: page=1, limit=20)

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Place an order | 🔒 Any |
| GET | `/api/orders` | List orders (own / all) | 🔒 Any |
| GET | `/api/orders/:id` | Get order details | 🔒 Any |
| PATCH | `/api/orders/:id/status` | Update order status | 🔒 Admin/Manager |

### Reports
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports/sales` | Total sales + daily breakdown | 🔒 Admin/Manager |
| GET | `/api/reports/products` | Top 10 products by revenue | 🔒 Admin/Manager |
| GET | `/api/reports/low-stock` | Products below threshold | 🔒 Admin/Manager |

### Customers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/customers` | List all customers | 🔒 Admin/Manager |
| GET | `/api/customers/:id` | Get customer details | 🔒 Admin/Manager |
| PUT | `/api/customers/:id` | Update customer | 🔒 Admin |

---

## Deployment (Render)

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add environment variables (MONGODB_URI, JWT_SECRET, etc.)
6. Deploy

---

## Security Measures

- Passwords hashed with **bcrypt** (salt rounds: 12)
- JWT tokens signed with a secret key, expire in 7 days
- **Helmet** sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
- All user inputs validated with **express-validator** before hitting controllers
- Request body limited to **10kb** to prevent payload attacks
- Sensitive config in **environment variables** (never committed)
- **Audit logging** via Winston on every authenticated request
- MongoDB transactions on order creation prevent race conditions

---

## Author

Student – Codebridge Academy Software Development Internship Program  
Training Period: 08 April 2026 – 08 May 2026
