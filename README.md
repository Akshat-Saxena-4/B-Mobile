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
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=generate-a-strong-random-secret
JWT_EXPIRES_IN=7d
ADMIN_REGISTER_SECRET=replace-with-an-admin-invite-code
ADMIN_LOGIN_EMAIL=admin@example.com
ADMIN_LOGIN_PASSWORD=change-this-admin-password
CLIENT_URLS=https://b-mobile.netlify.app,http://localhost:5173
SEED_DEMO_CATALOG_ON_START=false
```

### Client

```env
VITE_API_URL=https://b-mobile-qj9o.onrender.com/api/v1
```

## Notes

- Public registration supports `Customer` and `Shopkeeper`
- `Admin` registration is protected by `ADMIN_REGISTER_SECRET`
- If `ADMIN_LOGIN_EMAIL` and `ADMIN_LOGIN_PASSWORD` are set, the backend will create or sync that admin account on startup
- Product archival is implemented as a soft delete
- Coupon validation is exposed separately for checkout previews
- Render should provide `PORT` automatically in production
- The frontend can fall back to `https://b-mobile-qj9o.onrender.com/api/v1` when it is running on `https://b-mobile.netlify.app`
- The backend can fall back to allowing `https://b-mobile.netlify.app` even if `CLIENT_URLS` is omitted
- Run `npm run seed:phones` after connecting MongoDB, or temporarily set `SEED_DEMO_CATALOG_ON_START=true` to bootstrap an empty catalog once

## Deployment

### Backend on Render

- Deploy the repository with `render.yaml`, or create a web service pointing at the `server` directory.
- Set `MONGODB_URI`, `JWT_SECRET`, and `ADMIN_REGISTER_SECRET`.
- Keep the health check path as `/health`.
- If you want demo products on first boot, set `SEED_DEMO_CATALOG_ON_START=true`, let the service start once, then turn it back to `false`.

### Frontend on Netlify

- Netlify can build from the repository root using `netlify.toml`.
- Publish directory should be `client/dist`.
- Set `VITE_API_URL=https://b-mobile-qj9o.onrender.com/api/v1`.
- SPA routing is handled by `client/public/_redirects`, so direct refreshes on routes like `/products/iphone-16` work in production.

## Documentation

- [Implementation](./docs/IMPLEMENTATION.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Documentation](./docs/API.md)
