# Online Food Ordering System — Comprehensive DBMS Viva Preparation Guide
## B.Tech CSE Practical & Viva Examination Notes

---

## 1. Relational Database Normalization

### Q1: What is Normalization? What normal forms does this project achieve?
**Answer:** Normalization is the systematic technique of organizing attributes and tables of a relational database to minimize data redundancy and eliminate update, insertion, and deletion anomalies.
This project achieves **Third Normal Form (3NF)**:
* **1NF (First Normal Form)**:
  - All attributes contain atomic, indivisible values.
  - No multi-valued attributes or repeating groups (e.g. ordered items are not stored as comma-separated text inside `orders`, but in a separate junction table `order_items`).
  - Every table has a primary key.
* **2NF (Second Normal Form)**:
  - Meets 1NF.
  - Every non-prime attribute is fully functionally dependent on the primary key (no partial functional dependencies). In junction table `order_items`, columns like `quantity` and `unit_price` depend entirely on the key.
* **3NF (Third Normal Form)**:
  - Meets 2NF.
  - No transitive functional dependencies ($X \to Y$ and $Y \to Z$). Non-key columns depend only on the primary key. For example, `orders` references `restaurant_id` rather than storing the restaurant's name, phone, or address.

---

### Q2: Why did you deliberately denormalize `order_items.unit_price` and `orders.delivery_address_snapshot`?
**Answer:** This is a classic real-world application of the **Historical Snapshot Pattern (Intentional Denormalization)**:
1. **Price Freeze**: If restaurant owners alter menu item prices next week, past financial invoices and receipts must remain immutable. Storing `unit_price` at the instant of order placement protects accounting records from fluctuating.
2. **Address Preservation**: If a customer edits or removes an address from their profile, previous delivery receipts must retain the physical delivery address text for legal and delivery audit reasons.

---

## 2. Transactions & ACID Properties

### Q3: How does your order placement workflow demonstrate ACID properties?
**Answer:** In `orderController.js`, order placement executes inside an explicit MySQL transaction:
```javascript
const connection = await pool.getConnection();
await connection.beginTransaction();
// 1. Insert into orders
// 2. Insert into order_items
// 3. Insert into payments
await connection.commit();
```
* **Atomicity (All or Nothing)**: If inserting `payments` fails, `connection.rollback()` rolls back the entire batch. No orphaned `orders` or line items remain in the database.
* **Consistency**: Validates that all items belong to the same restaurant and prices are non-negative (`CHECK` constraints). The database transitions from one valid state to another.
* **Isolation**: MySQL InnoDB default isolation level (`REPEATABLE READ`) prevents concurrent transactions from seeing partial, uncommitted order rows (avoids dirty reads).
* **Durability**: Once `connection.commit()` succeeds, the changes are written to InnoDB's Write-Ahead Log (`ib_logfile`) and persist across server reboots.

---

### Q4: What are the MySQL Isolation Levels and Concurrency Anomalies?
| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
| :--- | :---: | :---: | :---: |
| **Read Uncommitted** | Possible | Possible | Possible |
| **Read Committed** | Prevented | Possible | Possible |
| **Repeatable Read** *(MySQL InnoDB Default)* | Prevented | Prevented | Prevented (via Next-Key Locking) |
| **Serializable** | Prevented | Prevented | Prevented |

---

## 3. Indexes & Query Optimization

### Q5: What is an Index? Which indexes did you create in this project?
**Answer:** An index is an auxiliary data structure (typically a B+ Tree in MySQL InnoDB) that enables rapid lookup of rows without performing a sequential full table scan ($O(N)$).
* **Clustered Index**: The primary key (`user_id`, `order_id`). The physical rows are stored in the leaf nodes of the primary B+ Tree.
* **Secondary / Non-Clustered Indexes**:
  * `idx_users_email` on `users(email)`: Gives $O(\log N)$ lookup time for customer and admin logins.
  * `idx_menu_items_lookup` on `menu_items(restaurant_id, is_available)`: Composite index optimized for the most frequent query: displaying active dishes for a restaurant.
  * `idx_orders_user_date` on `orders(user_id, order_date DESC)`: Composite index enabling fast sorting and pagination of a customer's order history.

### Q6: How do you verify if an index is being used?
**Answer:** Using the MySQL `EXPLAIN` keyword before any `SELECT` query.
```sql
EXPLAIN SELECT item_id, name, price 
FROM menu_items 
WHERE restaurant_id = 1 AND is_available = TRUE;
```
We look for:
- `type`: `ref` or `range` (desirable) instead of `ALL` (full table scan).
- `key`: Displays `idx_menu_items_lookup`.
- `rows`: Number of rows scanned (significantly reduced).

---

## 4. Referential Integrity & Foreign Key Actions

### Q7: What foreign key deletion strategies (`ON DELETE`) did you employ?
**Answer:**
1. **`ON DELETE CASCADE`** on `order_items.order_id`: If an order record is purged, its child line items are automatically deleted to prevent orphaned records. Same for `user_addresses.user_id` when a user account is deleted.
2. **`ON DELETE SET NULL`** on `orders.delivery_address_id` and `restaurants.manager_id`: If a user address is deleted from the address book, past orders remain valid with `delivery_address_id = NULL` (relying on `delivery_address_snapshot`).
3. **`ON DELETE RESTRICT`** on `orders.restaurant_id` and `menu_items.category_id`: Prevents deleting a restaurant or category if existing orders or dishes still depend on them.

---

## 5. Database Triggers & Views

### Q8: What triggers are implemented in this schema?
**Answer:** We implemented **AFTER INSERT**, **AFTER UPDATE**, and **AFTER DELETE** triggers on the `reviews` table (`trg_after_review_insert`, `trg_after_review_update`, `trg_after_review_delete`).
Whenever a customer posts or edits a review, the trigger calculates the aggregated arithmetic mean and count:
```sql
UPDATE restaurants
SET 
    rating_avg = (SELECT ROUND(AVG(rating), 2) FROM reviews WHERE restaurant_id = NEW.restaurant_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = NEW.restaurant_id)
WHERE restaurant_id = NEW.restaurant_id;
```
**Advantage:** Decouples rating recalculations from application code and eliminates the need for expensive `AVG(rating)` table scans every time a restaurant card is displayed.

### Q9: What is a View? Which views are used in this project?
**Answer:** A view is a virtual table defined by a stored SQL query. It does not store physical data itself (unless materialized), but dynamically executes its query upon access.
In our system:
1. `vw_order_details`: Joins orders, customers, restaurants, addresses, payments, and item counts for quick receipt rendering.
2. `vw_restaurant_performance`: Aggregates total orders, gross revenue, and average ticket size per restaurant.
3. `vw_popular_menu_items`: Ranks top-selling dishes by total sales volume.
4. `vw_customer_spending_summary`: Computes total lifetime spend and order count per customer.

---

## 6. Security & SQL Injection Prevention

### Q10: How does the system defend against SQL Injection?
**Answer:**
* **Parameterized Prepared Statements**: The application never concatenates strings into SQL clauses.
```javascript
// Vulnerable:
// pool.query(`SELECT * FROM users WHERE email = '${email}'`);

// Secure (Implemented):
pool.execute('SELECT * FROM users WHERE email = ?', [email]);
```
* **Protocol-Level Separation**: In prepared statements, the SQL query structure is sent to the MySQL server first for parsing and compilation. The parameters are transmitted in a separate binary packet. The MySQL query planner treats parameter input strictly as literal values, never as executable SQL code.
