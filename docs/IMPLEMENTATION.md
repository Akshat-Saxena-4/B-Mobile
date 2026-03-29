# Implementation Guide

## 1. Backend Foundation

1. Create the Express app with `helmet`, `cors`, `compression`, rate limiting, and centralized error handling.
2. Connect MongoDB through Mongoose and validate runtime environment variables.
3. Implement JWT auth middleware and role authorization middleware.

## 2. Domain Modeling

1. Model `User` with role support, seller approval, addresses, cart, and wishlist.
2. Model `Product` with pricing, inventory, specifications, ratings, and seller ownership.
3. Model `Review`, `Order`, and `Coupon` to support social proof, checkout, and promotions.

## 3. Business Logic

1. Add authentication controllers for registration, login, profile retrieval, and profile updates.
2. Add product controllers for public browsing plus seller CRUD and customer reviews.
3. Add user controllers for cart, wishlist, admin user management, and seller approvals.
4. Add order controllers for checkout, status updates, cancellation, and tracking.
5. Add coupon and dashboard controllers for admin promotions and analytics.

## 4. Frontend Architecture

1. Create Redux slices for `auth`, `products`, and `cart`.
2. Build service modules on top of a shared Axios instance with JWT injection.
3. Configure route protection with role-based guards.
4. Split customer, shopkeeper, and admin pages into separate route groups.

## 5. Customer Experience

1. Build a premium homepage with hero messaging, category spotlight, and featured products.
2. Add catalog filters, product detail views, wishlist interactions, and cart updates.
3. Implement checkout with address capture, payment selection, and coupon validation.
4. Add order history and profile management.

## 6. Shopkeeper Experience

1. Build a seller dashboard with sales trend charts and inventory alerts.
2. Add product creation and editing flows with structured specifications.
3. Add seller order management with fulfillment, tracking ID, carrier, and notes.

## 7. Admin Experience

1. Build a marketplace dashboard with revenue, role mix, recent orders, and seller queue.
2. Add seller approval and user status management.
3. Add catalog monitoring, order oversight, and coupon management.

## 8. Styling System

1. Use pure CSS with shared variables, a premium warm-neutral palette, expressive typography, and mobile-first layout primitives.
2. Use Framer Motion for staged reveals and elevated card interactions.
3. Keep reusable primitives in `components/common` and layout in `components/layout`.

## 9. Verification

1. Install workspace dependencies with `npm install`.
2. Build the React app with `npm --workspace client run build`.
3. Run syntax checks across backend source files.

