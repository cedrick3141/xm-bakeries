XM Bakeries - Stock and Order Management API
This is a backend REST API I built for xm-bakery to manage their products, orders, and inventory. The idea is to make:
- staff  add products,
- customers can place orders,
- and the system automatically updates stock when an order comes in.
- If something is out of stock, the order gets blocked.
- Managers and admins can also pull reports to see what is selling and what is running low.

Tech Stack

Node.js and Express.js - for building the API
MongoDB with Mongoose - for the database
JWT and bcryptjs - for authentication and password hashing
express-validator - to validate all incoming request data
Helmet - for security headers (Prevents some XSS attacks)
Winston - for logging
Jest and Supertest - for testing


Project Structure
xm-bakeries/
├── config/
│   └── db.js                  # database connection
├── src/
│   ├── app.js                 # express setup and middleware
│   ├── server.js              # entry point, starts the server
│   ├── controllers/           # business logic for each feature
│   ├── models/                # database schemas (User, Product, Order)
│   ├── routes/                # URL paths mapped to controllers
│   ├── middleware/            # auth checks, validation, error handling
│   └── utils/
│       └── logger.js          # winston logger config
└── tests/                     # all test files


What each part does

config/db.js - connects to MongoDB, exits the app if connection fails.
src/app.js - sets up all the middleware and mounts all the routes.
src/server.js - loads env variables and starts the server.
controllers - each file handles the logic for one feature area (auth, products, orders, reports, customers).
models - User.js, Product.js, and Order.js define the shape of data going into the database.
routes - each file defines the URL paths and which controller handles them.
middleware/auth.js - checks the JWT token on protected routes and verifies the user's role.
middleware/validate.js - runs input validation before any controller is reached.
middleware/errorHandler.js - catches any errors across the app and returns a clean JSON response.

API Endpoints

Auth

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me (requires token)
PUT /api/auth/profile (requires token)

Products

GET /api/products (public, supports ?category=bread&minPrice=100&search=croissant&page=1)
GET /api/products/:id
POST /api/products (admin or manager only)
PUT /api/products/:id (admin or manager only)
DELETE /api/products/:id (admin only, soft delete)

Orders

POST /api/orders (any logged in user)
GET /api/orders (customers see their own, admins see all)
GET /api/orders/:id
PATCH /api/orders/:id/status (admin or manager only)

Reports

GET /api/reports/sales (admin or manager)
GET /api/reports/products (admin or manager)
GET /api/reports/low-stock (admin or manager)

Customers

GET /api/customers (admin or manager)
GET /api/customers/:id (admin or manager)
PUT /api/customers/:id (admin only)


Roles
There are three roles: customer, manager, and admin.
-Customers can browse products and place orders. 
-Managers can update order status and view reports. 
-Admins have full access.
