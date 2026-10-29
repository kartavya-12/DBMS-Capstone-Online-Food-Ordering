# Online Food Ordering System — Comprehensive Testing Matrix

This testing specification documents functional, transactional, security, and integrity test cases executed against the system.

---

## 1. Automated & Integration Test Cases

| Test ID | Test Category | Scenario / Action | Input Payload / Precondition | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | System Health | `GET /api/health` | None | Returns HTTP 200 `{ status: "UP" }` | **PASS** |
| **TC-02** | Authentication | Valid customer login | `john.doe@example.com` / `Password123!` | Returns HTTP 200 with signed JWT token and user profile | **PASS** |
| **TC-03** | Authentication | Invalid password | `john.doe@example.com` / `WrongPass!` | Returns HTTP 401 "Invalid email or password" | **PASS** |
| **TC-04** | Security / SQLi | SQL injection attempt in login | Email: `' OR '1'='1`, Pass: `' OR '1'='1` | Parameterized query blocks injection; returns HTTP 401 | **PASS** |
| **TC-05** | Security / RBAC | Customer accessing Admin endpoint | `GET /api/admin/kpis` with customer Bearer token | Returns HTTP 403 Forbidden | **PASS** |
| **TC-06** | Security / RBAC | Admin accessing Admin endpoint | `GET /api/admin/kpis` with admin Bearer token | Returns HTTP 200 with KPI summary object | **PASS** |
| **TC-07** | Relational Rule | Single-restaurant order invariant | Order contains items from Restaurant 1 and Restaurant 2 | Backend transaction halts; returns HTTP 400 rejection | **PASS** |
| **TC-08** | Data Isolation | Order ownership verification | Customer A requests `GET /api/orders/3` (placed by Customer B) | Returns HTTP 403 Forbidden | **PASS** |
| **TC-09** | ACID Transaction | Atomic Order Placement | Valid cart items, address, and payment method | Commits `orders`, `order_items`, and `payments` atomically | **PASS** |
| **TC-10** | Price Freeze | Immutability of order receipts | Alter menu price in `menu_items` from ₹320 to ₹400 | Past order in `order_items` retains frozen ₹320.00 unit price | **PASS** |
| **TC-11** | State Machine | Customer cancellation on `CONFIRMED` | `POST /api/orders/:id/cancel` when status is `CONFIRMED` | Status changes to `CANCELLED`; payment set to `REFUNDED` | **PASS** |
| **TC-12** | State Machine | Customer cancellation on `PREPARING` | `POST /api/orders/:id/cancel` when kitchen has started | Rejects cancellation with HTTP 400 error | **PASS** |
| **TC-13** | Database Trigger | Post-delivery review insertion | Customer submits 5-star review for delivered order | Trigger `trg_after_review_insert` updates `restaurants.rating_avg` | **PASS** |
| **TC-14** | Database Trigger | One review per order constraint | Submitting second review for same `order_id` | Unique constraint `orders(order_id)` rejects with HTTP 409 | **PASS** |
| **TC-15** | Address Snapshot | Permanent delivery destination record | Customer updates or deletes saved address in `user_addresses` | `orders.delivery_address_snapshot` remains intact | **PASS** |

---

## 2. Manual End-to-End Testing Checklist

### Flow A: Customer Ordering Journey
1. Open `http://localhost:5173/login` and click **Customer** demo auto-fill.
2. Browse restaurant catalog on Home page and select **Spice Symphony**.
3. Toggle the **Pure Veg** switch; verify only vegetarian dishes are shown.
4. Add *"Paneer Tikka Angaare"* (Quantity 2) to cart.
5. Navigate back to Home and open **Bella Italia Trattoria**. Try adding a pizza.
   * *Verify:* Conflict modal appears warning that cart contains items from Spice Symphony.
   * *Verify:* Choosing "Keep Cart" preserves existing items; choosing "Start New Cart" resets cleanly.
6. Navigate to **Cart** (`/cart`) and review quantities and calculated taxes.
7. Click **Proceed to Checkout**. Select a delivery address, select **UPI** payment, and submit.
   * *Verify:* Order is placed and immediately displays the live tracker timeline at `/orders/:id`.

### Flow B: Kitchen & Admin Order Fulfillment
1. Open another browser tab or log in as **Admin** (`admin@foodexpress.com` / `Password123!`).
2. Go to **Admin Suite $\to$ Order Monitor** (`/admin/orders`).
3. Locate the new order. Use the status dropdown to transition:
   * `CONFIRMED` $\to$ `PREPARING` (In Kitchen)
   * `PREPARING` $\to$ `OUT_FOR_DELIVERY` (Dispatched)
   * `OUT_FOR_DELIVERY` $\to$ `DELIVERED`
4. Switch back to customer tab; refresh order receipt.
   * *Verify:* Status updates to `DELIVERED`.
   * *Verify:* Review & Rating form now appears.

### Flow C: Rating Trigger Verification
1. On the delivered order receipt, select 5 stars and submit: *"Sensational flavours, piping hot delivery!"*.
2. Visit **Spice Symphony** detail page or **Admin Analytics** (`/admin/reports`).
   * *Verify:* Restaurant `rating_avg` and `total_reviews` count have incremented automatically via the MySQL trigger.
