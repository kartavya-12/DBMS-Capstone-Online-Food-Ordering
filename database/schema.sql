-- ============================================================================
-- ONLINE FOOD ORDERING SYSTEM — DATABASE SCHEMA
-- DBMS Capstone Project (MySQL 8.0+ / InnoDB)
-- ============================================================================

DROP DATABASE IF EXISTS food_ordering_db;
CREATE DATABASE food_ordering_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_ordering_db;

-- ----------------------------------------------------------------------------
-- Table 1: USERS
-- Unified user table for Customers, Administrators, and Restaurant Managers
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('customer', 'admin', 'restaurant_manager') NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table 2: USER_ADDRESSES
-- Delivery addresses registered by customers (1:N with users)
-- ----------------------------------------------------------------------------
CREATE TABLE user_addresses (
    address_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    landmark VARCHAR(150) NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_addresses_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_addresses_user (user_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table 3: RESTAURANTS
-- Restaurant business profile, operating hours, and average ratings
-- ----------------------------------------------------------------------------
CREATE TABLE restaurants (
    restaurant_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    manager_id INT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    rating_avg DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    total_reviews INT UNSIGNED NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_restaurants_manager 
        FOREIGN KEY (manager_id) REFERENCES users(user_id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_restaurants_city (city),
    INDEX idx_restaurants_active (is_active),
    INDEX idx_restaurants_rating (rating_avg)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table 4: CATEGORIES
-- Master food classifications (e.g. Starters, Main Course, Desserts)
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_categories_active (is_active)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table 5: MENU_ITEMS
-- Catalog of dishes offered by restaurants (references restaurant & category)
-- ----------------------------------------------------------------------------
CREATE TABLE menu_items (
    item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_items_restaurant 
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_menu_items_category 
        FOREIGN KEY (category_id) REFERENCES categories(category_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_menu_item_price CHECK (price >= 0.00),
    INDEX idx_menu_items_restaurant (restaurant_id),
    INDEX idx_menu_items_category (category_id),
    INDEX idx_menu_items_available (is_available),
    INDEX idx_menu_items_lookup (restaurant_id, is_available)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table 6: ORDERS
-- Transactional header for customer food delivery orders
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    order_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    restaurant_id INT UNSIGNED NOT NULL,
    delivery_address_id INT UNSIGNED NULL,
    delivery_address_snapshot TEXT NOT NULL,
    order_status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estimated_delivery_time TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_orders_restaurant 
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_orders_address 
        FOREIGN KEY (delivery_address_id) REFERENCES user_addresses(address_id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_orders_subtotal CHECK (subtotal >= 0.00),
    CONSTRAINT chk_orders_tax CHECK (tax_amount >= 0.00),
    CONSTRAINT chk_orders_delivery_fee CHECK (delivery_fee >= 0.00),
    CONSTRAINT chk_orders_total CHECK (total_amount >= 0.00),
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_restaurant (restaurant_id),
    INDEX idx_orders_status (order_status),
    INDEX idx_orders_date (order_date),
    INDEX idx_orders_user_date (user_id, order_date DESC)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table 7: ORDER_ITEMS
-- Junction table resolving Many-to-Many relationship between orders and menu_items.
-- Stores frozen historical pricing and dish names.
-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
    order_item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    item_id INT UNSIGNED NOT NULL,
    item_name_snapshot VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    item_subtotal DECIMAL(10, 2) NOT NULL,
    notes VARCHAR(255) NULL,
    CONSTRAINT fk_order_items_order 
        FOREIGN KEY (order_id) REFERENCES orders(order_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_menu_item 
        FOREIGN KEY (item_id) REFERENCES menu_items(item_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_order_items_qty CHECK (quantity > 0),
    CONSTRAINT chk_order_items_price CHECK (unit_price >= 0.00),
    CONSTRAINT chk_order_items_subtotal CHECK (item_subtotal >= 0.00),
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_item (item_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table 8: PAYMENTS
-- Financial transactions linked 1:1 with orders
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
    payment_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL UNIQUE,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    payment_method ENUM('CASH_ON_DELIVERY', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET') NOT NULL,
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    CONSTRAINT fk_payments_order 
        FOREIGN KEY (order_id) REFERENCES orders(order_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_payments_amount CHECK (amount >= 0.00),
    INDEX idx_payments_status (payment_status),
    INDEX idx_payments_date (payment_date)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table 9: REVIEWS
-- Verified customer reviews and ratings (1 to 5) for delivered orders
-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
    review_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    restaurant_id INT UNSIGNED NOT NULL,
    order_id INT UNSIGNED NOT NULL UNIQUE,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_restaurant 
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_order 
        FOREIGN KEY (order_id) REFERENCES orders(order_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5),
    INDEX idx_reviews_restaurant (restaurant_id),
    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_rating (rating)
) ENGINE=InnoDB;

-- ============================================================================
-- DATABASE TRIGGERS
-- Automatic synchronization of restaurant average ratings and review totals
-- ============================================================================

DELIMITER $$

CREATE TRIGGER trg_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants
    SET 
        rating_avg = (SELECT ROUND(AVG(rating), 2) FROM reviews WHERE restaurant_id = NEW.restaurant_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = NEW.restaurant_id)
    WHERE restaurant_id = NEW.restaurant_id;
END$$

CREATE TRIGGER trg_after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants
    SET 
        rating_avg = (SELECT ROUND(AVG(rating), 2) FROM reviews WHERE restaurant_id = NEW.restaurant_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = NEW.restaurant_id)
    WHERE restaurant_id = NEW.restaurant_id;
END$$

CREATE TRIGGER trg_after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants
    SET 
        rating_avg = COALESCE((SELECT ROUND(AVG(rating), 2) FROM reviews WHERE restaurant_id = OLD.restaurant_id), 0.00),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = OLD.restaurant_id)
    WHERE restaurant_id = OLD.restaurant_id;
END$$

DELIMITER ;

-- ============================================================================
-- DATABASE VIEWS
-- Abstracted analytical & reporting layers for operations
-- ============================================================================

-- View 1: Complete Order Receipt & Lifecycle View
CREATE OR REPLACE VIEW vw_order_details AS
SELECT 
    o.order_id,
    o.order_date,
    o.order_status,
    u.user_id AS customer_id,
    u.name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    r.restaurant_id,
    r.name AS restaurant_name,
    o.delivery_address_snapshot,
    o.subtotal,
    o.tax_amount,
    o.delivery_fee,
    o.discount_amount,
    o.total_amount,
    p.payment_method,
    p.payment_status,
    p.transaction_reference,
    COUNT(oi.order_item_id) AS total_items_count,
    COALESCE(SUM(oi.quantity), 0) AS total_quantity_ordered
FROM orders o
JOIN users u ON o.user_id = u.user_id
JOIN restaurants r ON o.restaurant_id = r.restaurant_id
LEFT JOIN payments p ON o.order_id = p.order_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY 
    o.order_id, o.order_date, o.order_status, u.user_id, u.name, 
    u.email, u.phone, r.restaurant_id, r.name, o.delivery_address_snapshot, 
    o.subtotal, o.tax_amount, o.delivery_fee, o.discount_amount, 
    o.total_amount, p.payment_method, p.payment_status, p.transaction_reference;

-- View 2: Restaurant Performance & Financial Metrics
CREATE OR REPLACE VIEW vw_restaurant_performance AS
SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    r.city,
    r.rating_avg,
    r.total_reviews,
    r.is_active,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COALESCE(SUM(CASE WHEN o.order_status = 'DELIVERED' THEN o.total_amount ELSE 0 END), 0.00) AS gross_revenue,
    COALESCE(AVG(CASE WHEN o.order_status = 'DELIVERED' THEN o.total_amount ELSE NULL END), 0.00) AS average_order_value,
    COUNT(DISTINCT mi.item_id) AS menu_items_count
FROM restaurants r
LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id
LEFT JOIN menu_items mi ON r.restaurant_id = mi.restaurant_id
GROUP BY r.restaurant_id, r.name, r.city, r.rating_avg, r.total_reviews, r.is_active;

-- View 3: Most Popular Dishes Across the Platform
CREATE OR REPLACE VIEW vw_popular_menu_items AS
SELECT 
    mi.item_id,
    mi.name AS item_name,
    r.name AS restaurant_name,
    c.name AS category_name,
    mi.price AS current_price,
    mi.is_vegetarian,
    COALESCE(SUM(oi.quantity), 0) AS times_ordered,
    COALESCE(SUM(oi.item_subtotal), 0.00) AS total_revenue_generated
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
JOIN categories c ON mi.category_id = c.category_id
LEFT JOIN order_items oi ON mi.item_id = oi.item_id
LEFT JOIN orders o ON oi.order_id = o.order_id AND o.order_status != 'CANCELLED'
GROUP BY mi.item_id, mi.name, r.name, c.name, mi.price, mi.is_vegetarian;

-- View 4: Customer Spending Summary
CREATE OR REPLACE VIEW vw_customer_spending_summary AS
SELECT 
    u.user_id,
    u.name AS customer_name,
    u.email,
    u.phone,
    COUNT(o.order_id) AS total_orders_placed,
    COALESCE(SUM(CASE WHEN o.order_status = 'DELIVERED' THEN o.total_amount ELSE 0 END), 0.00) AS total_spent,
    COALESCE(AVG(CASE WHEN o.order_status = 'DELIVERED' THEN o.total_amount ELSE NULL END), 0.00) AS avg_ticket_size,
    MAX(o.order_date) AS last_order_date
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE u.role = 'customer'
GROUP BY u.user_id, u.name, u.email, u.phone;

