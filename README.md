# Velora Commerce

Production-ready MERN e-commerce platform with three roles:

- `Customer` for browsing, wishlisting, cart, checkout, and order tracking
- `Shopkeeper` for catalog management, inventory control, order handling, and analytics
- `Admin` for seller approvals, user governance, order monitoring, catalog oversight, and coupons

## Tech Stack

- Frontend: React + Vite + Redux Toolkit + Framer Motion + pure CSS
- Backend: Node.js + Express.js + JWT + bcrypt
- Database: MongoDB + Mongoose

## Project Structure

```text
premium-mern-commerce/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── store/
│       ├── styles/
│       └── utils/
├── server/
│   ├── package.json
│   └── src/
│       ├── config/
│       ├── constants/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── docs/
│   ├── API.md
│   ├── DATABASE_SCHEMA.md
│   └── IMPLEMENTATION.md
├── .env.example
├── package.json
└── README.md
```

## Role Highlights

### Customer

- Homepage with premium hero, category spotlight, and featured products
- Catalog search, filtering, and product detail pages
- Wishlist and cart management
- Coupon validation and checkout
- Order history, order tracking, and profile management

### Shopkeeper

- Seller dashboard with analytics and inventory alerts
- Add product workflow
- Product editing and archival
- Seller order management with status and tracking updates

### Admin

- Revenue and user analytics dashboard
- Seller approval and user activation controls
- Catalog monitoring and archival
- Order oversight
- Coupon creation, editing, and deletion

## Setup

1. Copy `.env.example` values into `server/.env` and `client/.env`.
2. Update MongoDB connection and JWT secret.
3. Install dependencies:

```bash
npm install
```

4. Start both apps:

```bash
npm run dev
```

5. Open `http://localhost:5173`

## Scripts

```bash
npm run dev
npm run build
npm run dev:client
npm run dev:server
```

## Environment Variables

### Server

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/premium-commerce
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
ADMIN_REGISTER_SECRET=replace-with-an-admin-invite-code
CLIENT_URL=http://localhost:5173
```

### Client

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Notes

- Public registration supports `Customer` and `Shopkeeper`
- `Admin` registration is protected by `ADMIN_REGISTER_SECRET`
- Product archival is implemented as a soft delete
- Coupon validation is exposed separately for checkout previews

## Documentation

- [Implementation](./docs/IMPLEMENTATION.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Documentation](./docs/API.md)

