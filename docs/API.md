# API Documentation

Base URL:

```text
http://localhost:5000/api/v1
```

All protected routes require:

```http
Authorization: Bearer <jwt>
```

## Auth

### `POST /auth/register`

Request:

```json
{
  "firstName": "Asha",
  "lastName": "Patel",
  "email": "asha@example.com",
  "phone": "9999999999",
  "password": "secret123",
  "role": "SHOPKEEPER",
  "shopName": "Asha Studio",
  "gstNumber": "GST12345",
  "storeDescription": "Premium home office essentials"
}
```

Response:

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {},
    "token": "jwt-token"
  }
}
```

### `POST /auth/login`

```json
{
  "email": "asha@example.com",
  "password": "secret123"
}
```

### `GET /auth/me`

Returns the authenticated user profile with populated cart and wishlist.

### `PUT /auth/me`

Updates identity, addresses, avatar, and seller profile fields.

## Products

### `GET /products`

Query params:

- `search`
- `category`
- `brand`
- `minPrice`
- `maxPrice`
- `sort`
- `page`
- `limit`
- `featured`

### `GET /products/featured`

Returns homepage featured products.

### `GET /products/:identifier`

Fetch by slug or MongoDB `_id`.

### `GET /products/seller/my-products`

Protected for `SHOPKEEPER` and `ADMIN`.

### `GET /products/admin/all`

Protected for `ADMIN`. Returns full catalog including non-public items.

### `POST /products`

Protected for `SHOPKEEPER` and `ADMIN`.

```json
{
  "title": "Velora Desk Lamp",
  "brand": "Velora",
  "category": "Home Studio",
  "shortDescription": "Minimal desk lamp with warm light control",
  "description": "A premium aluminum desk lamp...",
  "price": 2499,
  "compareAtPrice": 2999,
  "sku": "LAMP-001",
  "stock": 20,
  "images": ["https://..."],
  "specifications": [
    { "label": "Material", "value": "Aluminum" },
    { "label": "Warranty", "value": "1 year" }
  ]
}
```

### `PUT /products/:id`

Updates seller-owned or admin-managed products.

### `DELETE /products/:id`

Soft archives a product.

### `POST /products/:id/reviews`

Protected for `CUSTOMER`.

```json
{
  "rating": 5,
  "title": "Excellent finish",
  "comment": "Looks premium and works great."
}
```

## Users, Cart, Wishlist

### `GET /users/wishlist`

Protected for `CUSTOMER`.

### `POST /users/wishlist/:productId`

Adds or removes a product from wishlist.

### `GET /users/cart`

Returns populated cart items.

### `POST /users/cart`

```json
{
  "productId": "6611...",
  "quantity": 2
}
```

### `DELETE /users/cart/:productId`

Removes a cart item.

### `DELETE /users/cart`

Clears the cart.

### `GET /users`

Protected for `ADMIN`.

### `PATCH /users/:userId/status`

```json
{
  "isActive": false
}
```

### `PATCH /users/:userId/seller-approval`

```json
{
  "status": "APPROVED"
}
```

or

```json
{
  "status": "REJECTED",
  "rejectionReason": "Documents incomplete"
}
```

## Orders

### `POST /orders`

Protected for `CUSTOMER`.

```json
{
  "items": [
    { "productId": "6611...", "quantity": 1 }
  ],
  "shippingAddress": {
    "fullName": "Asha Patel",
    "phone": "9999999999",
    "line1": "12 Market Road",
    "line2": "",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "paymentMethod": "UPI",
  "couponCode": "VELORA10"
}
```

### `GET /orders/mine`

Returns customer orders.

### `GET /orders/seller`

Protected for `SHOPKEEPER` and `ADMIN`.

### `GET /orders/admin/all`

Protected for `ADMIN`.

### `GET /orders/:id`

Accessible by the customer on the order, involved sellers, or admin.

### `GET /orders/:id/track`

Returns fulfillment details and status history.

### `PATCH /orders/:id/status`

Protected for `SHOPKEEPER` and `ADMIN`.

```json
{
  "status": "SHIPPED",
  "trackingId": "TRK12345",
  "carrier": "BlueDart",
  "note": "Packed and handed to courier"
}
```

### `PATCH /orders/:id/cancel`

Protected for `CUSTOMER` while the order has not shipped.

## Coupons

### `POST /coupons/validate`

```json
{
  "code": "VELORA10",
  "subtotal": 4999
}
```

### `GET /coupons`

Protected for `ADMIN`.

### `POST /coupons`

Protected for `ADMIN`.

```json
{
  "code": "VELORA10",
  "description": "10% off launch offer",
  "discountType": "PERCENTAGE",
  "amount": 10,
  "minOrderValue": 1000,
  "maxDiscount": 500,
  "usageLimit": 100,
  "startsAt": "2026-03-29T00:00:00.000Z",
  "expiresAt": "2026-04-29T00:00:00.000Z",
  "isActive": true
}
```

### `PUT /coupons/:id`

Updates an existing coupon.

### `DELETE /coupons/:id`

Deletes a coupon.

## Dashboards

### `GET /dashboard/shopkeeper`

Protected for `SHOPKEEPER` and `ADMIN`.

Returns:

- seller product/order/revenue stats
- monthly sales
- top products
- recent orders
- low stock alerts

### `GET /dashboard/admin`

Protected for `ADMIN`.

Returns:

- marketplace stats
- monthly revenue
- recent orders
- seller approval queue
- role distribution

