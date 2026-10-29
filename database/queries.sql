-- ============================================================================
-- ONLINE FOOD ORDERING SYSTEM — PRACTICAL & ANALYTICAL SQL QUERIES
-- DBMS Capstone Demonstration Suite (20+ Tested SQL Queries)
-- ============================================================================

USE food_ordering_db;

-- ============================================================================
-- SECTION 1: CORE CRUD OPERATIONS & SAFE MUTATIONS
-- ============================================================================

-- Query 1: Basic SELECT — Retrieve all active vegetarian dishes under 350.00
SELECT 
    mi.item_id,
    mi.name AS dish_name,
    mi.price,
    r.name AS restaurant_name,
    c.name AS category_name
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
JOIN categories c ON mi.category_id = c.category_id
WHERE mi.is_vegetarian = TRUE 
  AND mi.price <= 350.00 
  AND mi.is_available = TRUE
ORDER BY mi.price ASC;

-- Query 2: INSERT — Add a new delivery address for an existing customer
INSERT INTO user_addresses (user_id, address_line1, address_line2, city, state, postal_code, landmark, is_default)
VALUES (4, 'Tower 9, Flat 1204, Whispering Palms', 'Lokhandwala Complex, Andheri West', 'Mumbai', 'Maharashtra', '400053', 'Opposite Infinity Mall', FALSE);

-- Query 3: UPDATE — Update restaurant operating hours and active status safely
UPDATE restaurants
SET 
    opening_time = '10:30:00',
    closing_time = '23:30:00',
    is_active = TRUE
WHERE restaurant_id = 1;

-- Query 4: SAFE DELETE — Remove a non-default user address that has never been used
DELETE FROM user_addresses 
WHERE address_id = 6 
  AND is_default = FALSE 
  AND address_id NOT IN (SELECT DISTINCT delivery_address_id FROM orders WHERE delivery_address_id IS NOT NULL);


-- ============================================================================
-- SECTION 2: MULTI-TABLE JOINS (INNER, LEFT, COMPOSITE)
-- ============================================================================

-- Query 5: 5-Table Join — Complete Order Audit (Customer, Restaurant, Delivery Address, Items, Payment)
SELECT 
    o.order_id,
    o.order_date,
    o.order_status,
    u.name AS customer_name,
    u.phone AS customer_phone,
    r.name AS restaurant_name,
    r.phone AS restaurant_phone,
    oi.item_name_snapshot,
    oi.unit_price,
    oi.quantity,
    oi.item_subtotal,
    o.total_amount AS order_grand_total,
    p.payment_method,
    p.payment_status
FROM orders o
INNER JOIN users u ON o.user_id = u.user_id
INNER JOIN restaurants r ON o.restaurant_id = r.restaurant_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN payments p ON o.order_id = p.order_id
WHERE o.order_id = 1;

-- Query 6: LEFT JOIN — Restaurants with Menu Item Counts and Orders count (even those with 0 orders)
SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    r.city,
    COUNT(DISTINCT mi.item_id) AS total_dishes_offered,
    COUNT(DISTINCT o.order_id) AS total_orders_received,
    COALESCE(SUM(CASE WHEN o.order_status = 'DELIVERED' THEN o.total_amount ELSE 0 END), 0.00) AS total_sales
FROM restaurants r
LEFT JOIN menu_items mi ON r.restaurant_id = mi.restaurant_id
LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id
GROUP BY r.restaurant_id, r.name, r.city
ORDER BY total_sales DESC;


-- ============================================================================
-- SECTION 3: AGGREGATIONS (COUNT, SUM, AVG, MIN, MAX) & GROUP BY / HAVING
-- ============================================================================

-- Query 7: Restaurant-wise Sales Performance with HAVING filter
SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    COUNT(o.order_id) AS total_completed_orders,
    MIN(o.total_amount) AS lowest_order_value,
    MAX(o.total_amount) AS highest_order_value,
    ROUND(AVG(o.total_amount), 2) AS average_order_value,
    SUM(o.total_amount) AS gross_revenue
FROM restaurants r
JOIN orders o ON r.restaurant_id = o.restaurant_id
WHERE o.order_status = 'DELIVERED'
GROUP BY r.restaurant_id, r.name
HAVING gross_revenue > 500.00
ORDER BY gross_revenue DESC;

-- Query 8: Category Popularity & Average Price Analysis
SELECT 
    c.category_id,
    c.name AS category_name,
    COUNT(mi.item_id) AS total_menu_items,
    ROUND(AVG(mi.price), 2) AS average_item_price,
    ROUND(MIN(mi.price), 2) AS cheapest_item_price,
    ROUND(MAX(mi.price), 2) AS priciest_item_price
FROM categories c
LEFT JOIN menu_items mi ON c.category_id = mi.category_id
GROUP BY c.category_id, c.name
ORDER BY total_menu_items DESC;


-- ============================================================================
-- SECTION 4: SUBQUERIES (SCALAR, CORRELATED, IN, EXISTS)
-- ============================================================================

-- Query 9: Correlated Subquery — Find menu items priced higher than their restaurant's average item price
SELECT 
    mi.item_id,
    mi.name AS dish_name,
    mi.price,
    r.name AS restaurant_name
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
WHERE mi.price > (
    SELECT AVG(inner_mi.price)
    FROM menu_items inner_mi
    WHERE inner_mi.restaurant_id = mi.restaurant_id
)
ORDER BY mi.restaurant_id, mi.price DESC;

-- Query 10: Subquery with IN — Customers who placed orders in October 2026
SELECT 
    u.user_id,
    u.name,
    u.email,
    u.phone
FROM users u
WHERE u.user_id IN (
    SELECT DISTINCT o.user_id 
    FROM orders o 
    WHERE o.order_date >= '2026-10-01 00:00:00' 
      AND o.order_date < '2026-11-01 00:00:00'
);

-- Query 11: Subquery with NOT EXISTS — Menu items that have never been ordered
SELECT 
    mi.item_id,
    mi.name AS dish_name,
    r.name AS restaurant_name,
    mi.price
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
WHERE NOT EXISTS (
    SELECT 1 
    FROM order_items oi 
    WHERE oi.item_id = mi.item_id
);

-- Query 12: Scalar Subquery in SELECT clause — Customer spending compared to overall platform average
SELECT 
    u.user_id,
    u.name AS customer_name,
    COALESCE(SUM(o.total_amount), 0.00) AS customer_total_spent,
    (SELECT ROUND(AVG(total_amount), 2) FROM orders WHERE order_status = 'DELIVERED') AS platform_average_order_value
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id AND o.order_status = 'DELIVERED'
WHERE u.role = 'customer'
GROUP BY u.user_id, u.name;


-- ============================================================================
-- SECTION 5: DOMAIN-SPECIFIC BUSINESS & REPORTING QUERIES
-- ============================================================================

-- Query 13: Monthly Revenue & Order Volume Breakdown
SELECT 
    DATE_FORMAT(o.order_date, '%Y-%m') AS order_month,
    COUNT(o.order_id) AS total_orders,
    SUM(CASE WHEN o.order_status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered_orders,
    SUM(CASE WHEN o.order_status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_orders,
    SUM(CASE WHEN o.order_status = 'DELIVERED' THEN o.subtotal ELSE 0 END) AS net_food_sales,
    SUM(CASE WHEN o.order_status = 'DELIVERED' THEN o.tax_amount ELSE 0 END) AS total_tax_collected,
    SUM(CASE WHEN o.order_status = 'DELIVERED' THEN o.delivery_fee ELSE 0 END) AS total_delivery_fees,
    SUM(CASE WHEN o.order_status = 'DELIVERED' THEN o.total_amount ELSE 0 END) AS gross_revenue
FROM orders o
GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
ORDER BY order_month DESC;

-- Query 14: Most Frequently Ordered Food Items (Top Selling Dishes)
SELECT 
    mi.item_id,
    mi.name AS dish_name,
    r.name AS restaurant_name,
    c.name AS category_name,
    SUM(oi.quantity) AS total_quantity_sold,
    COUNT(DISTINCT oi.order_id) AS distinct_orders_count,
    SUM(oi.item_subtotal) AS total_sales_volume
FROM order_items oi
JOIN menu_items mi ON oi.item_id = mi.item_id
JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
JOIN categories c ON mi.category_id = c.category_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status != 'CANCELLED'
GROUP BY mi.item_id, mi.name, r.name, c.name
ORDER BY total_quantity_sold DESC, total_sales_volume DESC
LIMIT 5;

-- Query 15: Customers with the Highest Spending (VIP Customers)
SELECT 
    u.user_id,
    u.name AS customer_name,
    u.email,
    u.phone,
    COUNT(o.order_id) AS total_orders_completed,
    SUM(o.total_amount) AS total_amount_spent,
    ROUND(AVG(o.total_amount), 2) AS average_spent_per_order
FROM users u
JOIN orders o ON u.user_id = o.user_id
WHERE o.order_status = 'DELIVERED'
GROUP BY u.user_id, u.name, u.email, u.phone
ORDER BY total_amount_spent DESC
LIMIT 10;

-- Query 16: Kitchen Display / Active Orders Pipeline (Pending, Confirmed, Preparing, Out for Delivery)
SELECT 
    o.order_id,
    r.name AS restaurant_name,
    u.name AS customer_name,
    u.phone AS customer_phone,
    o.order_status,
    o.total_amount,
    p.payment_method,
    p.payment_status,
    o.special_instructions,
    TIMESTAMPDIFF(MINUTE, o.order_date, NOW()) AS minutes_since_placed
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.restaurant_id
JOIN users u ON o.user_id = u.user_id
LEFT JOIN payments p ON o.order_id = p.order_id
WHERE o.order_status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY')
ORDER BY o.order_date ASC;

-- Query 17: Customer Order History with Group Concat Item List
SELECT 
    o.order_id,
    o.order_date,
    r.name AS restaurant_name,
    o.order_status,
    o.total_amount,
    p.payment_method,
    p.payment_status,
    GROUP_CONCAT(CONCAT(oi.item_name_snapshot, ' (x', oi.quantity, ')') SEPARATOR ', ') AS ordered_items
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.restaurant_id
LEFT JOIN payments p ON o.order_id = p.order_id
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.user_id = 4
GROUP BY o.order_id, o.order_date, r.name, o.order_status, o.total_amount, p.payment_method, p.payment_status
ORDER BY o.order_date DESC;


-- ============================================================================
-- SECTION 6: ADVANCED SQL — WINDOW FUNCTIONS & RANKING
-- ============================================================================

-- Query 18: DENSE_RANK() — Rank Customers by Total Spending
SELECT 
    u.user_id,
    u.name AS customer_name,
    SUM(o.total_amount) AS total_spent,
    DENSE_RANK() OVER (ORDER BY SUM(o.total_amount) DESC) AS spending_rank
FROM users u
JOIN orders o ON u.user_id = o.user_id
WHERE o.order_status = 'DELIVERED'
GROUP BY u.user_id, u.name;

-- Query 19: Running Revenue Total over time using SUM() OVER (ORDER BY ...)
SELECT 
    o.order_id,
    o.order_date,
    o.total_amount,
    SUM(o.total_amount) OVER (ORDER BY o.order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_revenue
FROM orders o
WHERE o.order_status = 'DELIVERED'
ORDER BY o.order_date ASC;


-- ============================================================================
-- SECTION 7: DATABASE VIEWS USAGE
-- ============================================================================

-- Query 20: Querying the analytical view for Restaurant Performance
SELECT 
    restaurant_name,
    city,
    rating_avg,
    total_reviews,
    total_orders,
    gross_revenue,
    average_order_value
FROM vw_restaurant_performance
ORDER BY gross_revenue DESC;

-- Query 21: Querying the analytical view for Popular Dishes
SELECT 
    item_name,
    restaurant_name,
    category_name,
    times_ordered,
    total_revenue_generated
FROM vw_popular_menu_items
WHERE times_ordered > 0
ORDER BY times_ordered DESC;


-- ============================================================================
-- SECTION 8: QUERY OPTIMIZATION WITH EXPLAIN
-- ============================================================================

-- Query 22: Performance analysis using composite index (restaurant_id, is_available)
EXPLAIN SELECT 
    item_id, name, price 
FROM menu_items 
WHERE restaurant_id = 1 AND is_available = TRUE;


-- ============================================================================
-- SECTION 9: TRANSACTION HANDLING (ACID ATOMIC ORDER PLACEMENT)
-- ============================================================================

-- Query 23: Complete Transaction Demonstration (Atomic Order Placement)
-- If any step fails (e.g., negative item price, invalid address), the entire transaction rolls back.
START TRANSACTION;

-- Step 1: Insert Order Header
INSERT INTO orders (
    user_id, restaurant_id, delivery_address_id, delivery_address_snapshot,
    order_status, subtotal, tax_amount, delivery_fee, discount_amount, total_amount,
    special_instructions
) VALUES (
    4, 1, 1, 'Flat 402, Sunshine Heights, Mumbai - 400001',
    'CONFIRMED', 640.00, 32.00, 50.00, 0.00, 722.00,
    'Leave at the door'
);

-- Step 2: Grab the auto-generated order_id
SET @new_order_id = LAST_INSERT_ID();

-- Step 3: Insert Line Items with frozen prices
INSERT INTO order_items (order_id, item_id, item_name_snapshot, unit_price, quantity, item_subtotal)
VALUES (@new_order_id, 1, 'Paneer Tikka Angaare', 320.00, 2, 640.00);

-- Step 4: Insert Payment Record
INSERT INTO payments (order_id, transaction_reference, payment_method, payment_status, amount)
VALUES (@new_order_id, CONCAT('TXN_', UNIX_TIMESTAMP(), '_', @new_order_id), 'UPI', 'COMPLETED', 722.00);

-- Step 5: Commit atomically
COMMIT;

