# Online Food Ordering System — Data Dictionary

This document details the normalized relational database schema for the **Online Food Ordering System** (`food_ordering_db`). All tables are implemented using MySQL 8.0 with the **InnoDB** storage engine to support ACID transactions, foreign key cascades, and check constraints.

---

## 1. Table: `users`
Stores all registered actors in the platform including Customers, System Administrators, and Restaurant Managers.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `INT UNSIGNED` | NO | PK | `AUTO_INCREMENT` | Unique identifier for each user account. |
| `name` | `VARCHAR(100)` | NO | - | None | Full legal name of the user. |
| `email` | `VARCHAR(150)` | NO | UNIQUE | None | Verified email address used as the primary login credential. |
| `password_hash` | `VARCHAR(255)` | NO | - | None | Cryptographic password hash generated using bcrypt (cost 10). |
| `phone` | `VARCHAR(20)` | NO | - | None | Contact mobile phone number. |
| `role` | `ENUM(...)` | NO | - | `'customer'` | Role authorization: `'customer'`, `'admin'`, or `'restaurant_manager'`. |
| `is_active` | `BOOLEAN` | NO | - | `TRUE` | Account flag allowing administrative deactivation or bans. |
| `created_at` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Account creation timestamp. |
| `updated_at` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Timestamp automatically updated on modification. |

---

## 2. Table: `user_addresses`
Physical delivery addresses saved by customers. One customer can maintain multiple addresses (e.g. Home, Work).

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `address_id` | `INT UNSIGNED` | NO | PK | `AUTO_INCREMENT` | Unique identifier for each address record. |
| `user_id` | `INT UNSIGNED` | NO | FK | None | References `users(user_id)` ON DELETE CASCADE. |
| `address_line1` | `VARCHAR(255)` | NO | - | None | Building, apartment number, and street name. |
| `address_line2` | `VARCHAR(255)` | YES | - | `NULL` | Area, suite, or additional location info. |
| `city` | `VARCHAR(100)` | NO | - | None | Destination city. |
| `state` | `VARCHAR(100)` | NO | - | None | Destination state/province. |
| `postal_code` | `VARCHAR(20)` | NO | - | None | Postal PIN / ZIP code. |
| `landmark` | `VARCHAR(150)` | YES | - | `NULL` | Recognizable nearby navigation landmark. |
| `is_default` | `BOOLEAN` | NO | - | `FALSE` | Indicates customer's preferred primary address. |
| `created_at` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Timestamp address was added. |

---

## 3. Table: `restaurants`
Profiles, operational metadata, business hours, and performance ratings for registered restaurants.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `restaurant_id` | `INT UNSIGNED` | NO | PK | `AUTO_INCREMENT` | Unique identifier for the restaurant. |
| `manager_id` | `INT UNSIGNED` | YES | FK | `NULL` | References `users(user_id)` ON DELETE SET NULL. |
| `name` | `VARCHAR(150)` | NO | - | None | Commercial name of the restaurant. |
| `description` | `TEXT` | YES | - | `NULL` | Promotional bio and cuisine specialties. |
| `address` | `VARCHAR(255)` | NO | - | None | Physical kitchen/outlet street address. |
| `city` | `VARCHAR(100)` | NO | - | None | Operating city. |
| `phone` | `VARCHAR(20)` | NO | - | None | Restaurant phone number. |
| `email` | `VARCHAR(150)` | NO | - | None | Restaurant inquiries/billing email. |
| `opening_time` | `TIME` | NO | - | None | Kitchen daily opening time. |
| `closing_time` | `TIME` | NO | - | None | Kitchen daily closing time. |
| `rating_avg` | `DECIMAL(3, 2)` | NO | - | `0.00` | Aggregated customer rating (1.00 to 5.00) updated via triggers. |
| `total_reviews` | `INT UNSIGNED` | NO | - | `0` | Total verified reviews count updated via triggers. |
| `is_active` | `BOOLEAN` | NO | - | `TRUE` | Operational status (can be toggled by admin/manager). |
| `image_url` | `VARCHAR(500)` | YES | - | `NULL` | Banner photo URL. |
| `created_at` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Restaurant registration timestamp. |
| `updated_at` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Automatic update timestamp. |

---

## 4. Table: `categories`
Global taxonomy for categorizing dishes across all restaurant menus.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `category_id` | `INT UNSIGNED` | NO | PK | `AUTO_INCREMENT` | Unique identifier for the category. |
| `name` | `VARCHAR(100)` | NO | UNIQUE | None | Category title (e.g. 'Biryani & Rice', 'Pizzas'). |
| `description` | `TEXT` | YES | - | `NULL` | Detailed description of the category. |
| `image_url` | `VARCHAR(500)` | YES | - | `NULL` | Thumbnail image for category browsing. |
| `is_active` | `BOOLEAN` | NO | - | `TRUE` | Category visibility toggle. |
| `created_at` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Creation timestamp. |

---

## 5. Table: `menu_items`
Catalog of food items offered by restaurants.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `item_id` | `INT UNSIGNED` | NO | PK | `AUTO_INCREMENT` | Unique identifier for the dish. |
| `restaurant_id` | `INT UNSIGNED` | NO | FK | None | References `restaurants(restaurant_id)` ON DELETE CASCADE. |
| `category_id` | `INT UNSIGNED` | NO | FK | None | References `categories(category_id)` ON DELETE RESTRICT. |
| `name` | `VARCHAR(150)` | NO | - | None | Dish title. |
| `description` | `TEXT` | YES | - | `NULL` | Ingredients, culinary style, and flavor description. |
| `price` | `DECIMAL(10, 2)`| NO | - | None | Current selling price (`CHECK (price >= 0.00)`). |
| `is_vegetarian` | `BOOLEAN` | NO | - | `FALSE` | Vegetarian dietary flag. |
| `is_available` | `BOOLEAN` | NO | - | `TRUE` | Stock availability toggle for kitchen management. |
| `image_url` | `VARCHAR(500)` | YES | - | `NULL` | High-resolution food photo URL. |
| `created_at` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updated_at` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Automatic update timestamp. |

---

## 6. Table: `orders`
Master record for food delivery orders placed by customers.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `order_id` | `INT UNSIGNED` | NO | PK | `AUTO_INCREMENT` | Unique primary key for the order. |
| `user_id` | `INT UNSIGNED` | NO | FK | None | References `users(user_id)` ON DELETE RESTRICT. |
| `restaurant_id` | `INT UNSIGNED` | NO | FK | None | References `restaurants(restaurant_id)` ON DELETE RESTRICT. |
| `delivery_address_id` | `INT UNSIGNED` | YES | FK | `NULL` | References `user_addresses(address_id)` ON DELETE SET NULL. |
| `delivery_address_snapshot` | `TEXT` | NO | - | None | **Immutable snapshot** of address text at time of purchase. |
| `order_status` | `ENUM(...)` | NO | - | `'PENDING'` | Lifecycle: `'PENDING'`, `'CONFIRMED'`, `'PREPARING'`, `'OUT_FOR_DELIVERY'`, `'DELIVERED'`, `'CANCELLED'`. |
| `subtotal` | `DECIMAL(10, 2)`| NO | - | None | Sum of item subtotals (`CHECK (subtotal >= 0.00)`). |
| `tax_amount` | `DECIMAL(10, 2)`| NO | - | `0.00` | Calculated sales tax (e.g., 5% GST). |
| `delivery_fee` | `DECIMAL(10, 2)`| NO | - | `0.00` | Logistics fee based on distance. |
| `discount_amount`| `DECIMAL(10, 2)`| NO | - | `0.00` | Applied promo or voucher discount. |
| `total_amount` | `DECIMAL(10, 2)`| NO | - | None | Final customer payable amount (`CHECK >= 0.00`). |
| `special_instructions` | `TEXT` | YES | - | `NULL` | Customer preparation/delivery notes. |
| `order_date` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Timestamp order was placed. |
| `delivered_at` | `TIMESTAMP` | YES | - | `NULL` | Timestamp order was marked delivered. |
| `updated_at` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Automatic update timestamp. |

---

## 7. Table: `order_items`
Junction table resolving Many-to-Many between `orders` and `menu_items`. Contains price freeze snapshots.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `order_item_id` | `INT UNSIGNED` | NO | PK | `AUTO_INCREMENT` | Unique identifier for line item. |
| `order_id` | `INT UNSIGNED` | NO | FK | None | References `orders(order_id)` ON DELETE CASCADE. |
| `item_id` | `INT UNSIGNED` | NO | FK | None | References `menu_items(item_id)` ON DELETE RESTRICT. |
| `item_name_snapshot` | `VARCHAR(150)`| NO | - | None | Name of dish at time of purchase. |
| `unit_price` | `DECIMAL(10, 2)`| NO | - | None | **Historical price snapshot** at time of purchase. |
| `quantity` | `INT UNSIGNED` | NO | - | None | Number of portions (`CHECK (quantity > 0)`). |
| `item_subtotal`| `DECIMAL(10, 2)`| NO | - | None | `unit_price * quantity`. |
| `notes` | `VARCHAR(255)` | YES | - | `NULL` | Optional item-specific notes (e.g. extra spicy). |

---

## 8. Table: `payments`
Financial transactions tied 1-to-1 with orders.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `payment_id` | `INT UNSIGNED` | NO | PK | `AUTO_INCREMENT` | Unique identifier for payment record. |
| `order_id` | `INT UNSIGNED` | NO | FK, UK | None | Unique reference to `orders(order_id)`. |
| `transaction_reference` | `VARCHAR(100)`| NO | UNIQUE | None | External or synthetic payment reference token. |
| `payment_method`| `ENUM(...)` | NO | - | None | `'CASH_ON_DELIVERY'`, `'CREDIT_CARD'`, `'DEBIT_CARD'`, `'UPI'`, `'NET_BANKING'`, `'WALLET'`. |
| `payment_status`| `ENUM(...)` | NO | - | `'PENDING'` | `'PENDING'`, `'COMPLETED'`, `'FAILED'`, `'REFUNDED'`. |
| `amount` | `DECIMAL(10, 2)`| NO | - | None | Total amount charged (`CHECK (amount >= 0.00)`). |
| `payment_date` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Transaction timestamp. |
| `notes` | `TEXT` | YES | - | `NULL` | Payment gateway transaction notes. |

---

## 9. Table: `reviews`
Verified post-delivery customer feedback and star ratings.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `review_id` | `INT UNSIGNED` | NO | PK | `AUTO_INCREMENT` | Unique identifier for review. |
| `user_id` | `INT UNSIGNED` | NO | FK | None | References `users(user_id)` ON DELETE CASCADE. |
| `restaurant_id` | `INT UNSIGNED` | NO | FK | None | References `restaurants(restaurant_id)` ON DELETE CASCADE. |
| `order_id` | `INT UNSIGNED` | NO | FK, UK | None | References `orders(order_id)` ON DELETE CASCADE (1 review per order). |
| `rating` | `TINYINT UNSIGNED` | NO | - | None | Rating score from 1 to 5 (`CHECK (rating BETWEEN 1 AND 5)`). |
| `comment` | `TEXT` | YES | - | `NULL` | Qualitative customer feedback text. |
| `created_at` | `TIMESTAMP` | NO | - | `CURRENT_TIMESTAMP` | Timestamp review was posted. |

