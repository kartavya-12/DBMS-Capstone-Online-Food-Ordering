# Online Food Ordering System — REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Customer Registration
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Permission:** Public
- **Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "phone": "+91 98765 11111"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 4,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+91 98765 11111",
      "role": "customer"
    }
  }
}
```

### 1.2 User Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Permission:** Public
- **Request Body:**
```json
{
  "email": "admin@foodexpress.com",
  "password": "Password123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Welcome back, System Administrator!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "name": "System Administrator",
      "email": "admin@foodexpress.com",
      "phone": "+91 98765 00001",
      "role": "admin"
    }
  }
}
```

### 1.3 Get Current User Profile
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Permission:** Authenticated (`customer`, `admin`, `restaurant_manager`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": 4,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+91 98765 11111",
    "role": "customer",
    "total_orders": 3,
    "total_addresses": 2
  }
}
```

---

## 2. Customer Delivery Addresses (`/api/addresses`)

### 2.1 Get Saved Addresses
- **Method:** `GET`
- **Path:** `/api/addresses`
- **Permission:** Authenticated Customer
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "address_id": 1,
      "user_id": 4,
      "address_line1": "Flat 402, Sunshine Heights",
      "address_line2": "Park Street Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postal_code": "400001",
      "landmark": "Near City Mall",
      "is_default": 1
    }
  ]
}
```

### 2.2 Add New Address
- **Method:** `POST`
- **Path:** `/api/addresses`
- **Permission:** Authenticated Customer
- **Request Body:**
```json
{
  "address_line1": "Tower 9, Flat 1204",
  "address_line2": "Lokhandwala Complex",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400053",
  "landmark": "Near Infinity Mall",
  "is_default": true
}
```

---

## 3. Restaurants & Catalog (`/api/restaurants`)

### 3.1 List Restaurants
- **Method:** `GET`
- **Path:** `/api/restaurants?search=spice&city=Bangalore&rating=4.0`
- **Permission:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "restaurant_id": 1,
      "name": "Spice Symphony",
      "description": "Authentic North Indian, aromatic Awadhi Biryanis...",
      "address": "14 Heritage Boulevard",
      "city": "Bangalore",
      "phone": "+91 80 4123 4567",
      "opening_time": "11:00:00",
      "closing_time": "23:00:00",
      "rating_avg": 4.80,
      "total_reviews": 12,
      "is_active": 1,
      "image_url": "https://..."
    }
  ]
}
```

### 3.2 Get Single Restaurant with Menu & Reviews
- **Method:** `GET`
- **Path:** `/api/restaurants/:id`
- **Permission:** Public
- **Response (200 OK):** Returns restaurant metadata along with nested `menu_items` array and recent customer `reviews`.

---

## 4. Menu Items (`/api/menu-items`)

### 4.1 Search & Filter Menu Items
- **Method:** `GET`
- **Path:** `/api/menu-items?restaurant_id=1&is_vegetarian=true&search=paneer`
- **Permission:** Public

### 4.2 Create Menu Item
- **Method:** `POST`
- **Path:** `/api/menu-items`
- **Permission:** Admin or Assigned Restaurant Manager
- **Request Body:**
```json
{
  "restaurant_id": 1,
  "category_id": 1,
  "name": "Afghani Soya Chaap",
  "description": "Charcoal grilled soya chaap marinated in rich cashew and cream paste.",
  "price": 310.00,
  "is_vegetarian": true,
  "is_available": true
}
```

---

## 5. Orders & Transactions (`/api/orders`)

### 5.1 Place Order (ACID Transaction)
- **Method:** `POST`
- **Path:** `/api/orders`
- **Permission:** Authenticated Customer
- **Request Body:**
```json
{
  "restaurant_id": 1,
  "delivery_address_id": 1,
  "payment_method": "UPI",
  "special_instructions": "Make it medium spicy",
  "items": [
    {
      "item_id": 1,
      "quantity": 2,
      "notes": "Extra mint chutney"
    },
    {
      "item_id": 3,
      "quantity": 1
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "order_id": 11,
    "restaurant_name": "Spice Symphony",
    "order_status": "CONFIRMED",
    "subtotal": 1120.00,
    "tax_amount": 56.00,
    "delivery_fee": 40.00,
    "total_amount": 1216.00,
    "payment_method": "UPI",
    "payment_status": "COMPLETED",
    "transaction_reference": "TXN_1761763910_11"
  }
}
```

### 5.2 Get Customer Order History
- **Method:** `GET`
- **Path:** `/api/orders/my-orders`
- **Permission:** Authenticated Customer

### 5.3 Cancel Order
- **Method:** `POST`
- **Path:** `/api/orders/:id/cancel`
- **Permission:** Order Owner (Customer) or Admin
- **Rule:** Permitted only when `order_status IN ('PENDING', 'CONFIRMED')`. Auto-refunds payment.

### 5.4 Update Order Status
- **Method:** `PATCH`
- **Path:** `/api/orders/:id/status`
- **Permission:** Admin or Assigned Restaurant Manager
- **Request Body:**
```json
{
  "status": "PREPARING"
}
```

---

## 6. Reviews & Ratings (`/api/reviews`)

### 6.1 Submit Order Review
- **Method:** `POST`
- **Path:** `/api/reviews`
- **Permission:** Authenticated Customer
- **Rule:** Order must be in `DELIVERED` status. Trigger updates restaurant rating automatically.
- **Request Body:**
```json
{
  "order_id": 1,
  "rating": 5,
  "comment": "Exceptional flavor and piping hot delivery!"
}
```

---

## 7. Admin & Reporting Suite (`/api/admin`)

### 7.1 Dashboard KPIs
- **Method:** `GET`
- **Path:** `/api/admin/kpis`
- **Permission:** Admin
- **Returns:** Gross revenue, total orders, active orders count, customer counts, and recent orders.

### 7.2 Sales Analytics & Reports
- **Method:** `GET`
- **Path:** `/api/admin/reports`
- **Permission:** Admin
- **Returns:** Monthly sales aggregate, restaurant-wise performance from `vw_restaurant_performance`, top 5 dishes from `vw_popular_menu_items`, and VIP customers from `vw_customer_spending_summary`.

