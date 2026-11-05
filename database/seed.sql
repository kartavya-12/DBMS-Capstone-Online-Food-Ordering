-- ============================================================================
-- ONLINE FOOD ORDERING SYSTEM — SEED DATA
-- Demonstration & Test Data (MySQL 8.0+)
-- ============================================================================

USE food_ordering_db;

-- ----------------------------------------------------------------------------
-- 1. Insert Users (Admin, Restaurant Managers, Customers)
-- Note: Default demonstration password for all seeded users is "Password123!"
-- BCrypt hash: $2a$10$5Ot/FtQ..pi.wfM5v4SIh.t05QtcNrxPxt7jE4hyiHe0XFL7Nbmxa
-- ----------------------------------------------------------------------------
INSERT INTO users (user_id, name, email, password_hash, phone, role, is_active) VALUES
(1, 'System Administrator', 'admin@foodexpress.com', '$2a$10$5Ot/FtQ..pi.wfM5v4SIh.t05QtcNrxPxt7jE4hyiHe0XFL7Nbmxa', '+91 98765 00001', 'admin', TRUE),
(2, 'Chef Rajesh Khanna', 'manager.spice@foodexpress.com', '$2a$10$5Ot/FtQ..pi.wfM5v4SIh.t05QtcNrxPxt7jE4hyiHe0XFL7Nbmxa', '+91 98765 00002', 'restaurant_manager', TRUE),
(3, 'Marco Rossi', 'manager.pizza@foodexpress.com', '$2a$10$5Ot/FtQ..pi.wfM5v4SIh.t05QtcNrxPxt7jE4hyiHe0XFL7Nbmxa', '+91 98765 00003', 'restaurant_manager', TRUE),
(4, 'John Doe', 'john.doe@example.com', '$2a$10$5Ot/FtQ..pi.wfM5v4SIh.t05QtcNrxPxt7jE4hyiHe0XFL7Nbmxa', '+91 98765 11111', 'customer', TRUE),
(5, 'Priya Sharma', 'priya.sharma@example.com', '$2a$10$5Ot/FtQ..pi.wfM5v4SIh.t05QtcNrxPxt7jE4hyiHe0XFL7Nbmxa', '+91 98765 22222', 'customer', TRUE),
(6, 'Alex Kumar', 'alex.kumar@example.com', '$2a$10$5Ot/FtQ..pi.wfM5v4SIh.t05QtcNrxPxt7jE4hyiHe0XFL7Nbmxa', '+91 98765 33333', 'customer', TRUE);

-- ----------------------------------------------------------------------------
-- 2. Insert User Addresses
-- ----------------------------------------------------------------------------
INSERT INTO user_addresses (address_id, user_id, address_line1, address_line2, city, state, postal_code, landmark, is_default) VALUES
(1, 4, 'Flat 402, Sunshine Heights', 'Park Street Road', 'Mumbai', 'Maharashtra', '400001', 'Near City Mall', TRUE),
(2, 4, 'Tech Park Phase 2, Tower B, 5th Floor', 'Whitefield', 'Bangalore', 'Karnataka', '560066', 'Opposite Metro Station', FALSE),
(3, 5, 'House No. 12B, Rose Villa', 'Indiranagar 100ft Road', 'Bangalore', 'Karnataka', '560038', 'Behind Cafe Coffee Day', TRUE),
(4, 5, 'Apartment 703, Lakeview Enclave', 'Koramangala 4th Block', 'Bangalore', 'Karnataka', '560034', 'Near Sony Signal', FALSE),
(5, 6, 'Plot 88, Sector 15', 'CBD Belapur', 'Navi Mumbai', 'Maharashtra', '400614', 'Near Sector Park', TRUE),
(6, 6, 'Studio 14, High Point Residency', 'Bandra West', 'Mumbai', 'Maharashtra', '400050', 'Next to Gold Gym', FALSE);

-- ----------------------------------------------------------------------------
-- 3. Insert Restaurants
-- ----------------------------------------------------------------------------
INSERT INTO restaurants (restaurant_id, manager_id, name, description, address, city, phone, email, opening_time, closing_time, is_active, image_url) VALUES
(1, 2, 'Spice Symphony', 'Authentic North Indian, aromatic Awadhi Biryanis, and clay-oven Tandoori kebabs.', '14 Heritage Boulevard, Indiranagar', 'Bangalore', '+91 80 4123 4567', 'contact@spicesymphony.com', '11:00:00', '23:00:00', TRUE, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'),
(2, 3, 'Bella Italia Trattoria', 'Artisanal wood-fired pizzas, handmade pastas, and classic Italian desserts.', '45 Church Street, Brigade Road', 'Bangalore', '+91 80 4890 1234', 'ciao@bellaitalia.com', '12:00:00', '23:30:00', TRUE, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'),
(3, NULL, 'Dragon Wok Asian Kitchen', 'Authentic wok-tossed noodles, spicy Sichuan bowls, and delicate steamed dim sums.', '22 Linking Road, Bandra West', 'Mumbai', '+91 22 2640 9876', 'info@dragonwok.com', '11:30:00', '23:00:00', TRUE, 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80'),
(4, NULL, 'The Green Bistro', 'Wholesome organic salads, warm grain bowls, fresh wraps, and cold-pressed juices.', '88 Koramangala 5th Block', 'Bangalore', '+91 80 4222 3344', 'hello@greenbistro.com', '08:00:00', '21:30:00', TRUE, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80');

-- ----------------------------------------------------------------------------
-- 4. Insert Categories
-- ----------------------------------------------------------------------------
INSERT INTO categories (category_id, name, description, image_url, is_active) VALUES
(1, 'Starters & Appetizers', 'Crispy finger foods, tandoori skewers, and fresh rolls to kick off your meal.', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400&q=80', TRUE),
(2, 'Biryani & Rice', 'Fragrant long-grain basmati cooked with saffron, rich spices, and savory aromatics.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', TRUE),
(3, 'Artisanal Pizzas', 'Hand-stretched dough baked in stone ovens with imported mozzarella and fresh basil.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', TRUE),
(4, 'Pastas & Bowls', 'Creamy Alfredo, rich Bolognese, pesto linguine, and Asian rice bowls.', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=400&q=80', TRUE),
(5, 'Main Course & Curries', 'Rich slow-cooked gravies, paneer specialties, butter chicken, and breads.', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&q=80', TRUE),
(6, 'Desserts & Beverages', 'Decadent chocolate lava cakes, classic Tiramisu, mocktails, and shakes.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80', TRUE);

-- ----------------------------------------------------------------------------
-- 5. Insert Menu Items
-- ----------------------------------------------------------------------------
INSERT INTO menu_items (item_id, restaurant_id, category_id, name, description, price, is_vegetarian, is_available, image_url) VALUES
-- Spice Symphony (Restaurant 1)
(1, 1, 1, 'Paneer Tikka Angaare', 'Succulent cubes of cottage cheese marinated in spiced yogurt and grilled in a clay tandoor.', 320.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80'),
(2, 1, 1, 'Murgh Malai Kebab', 'Tender chicken skewers marinated with cardamom, rich cream, cheese, and roasted to golden perfection.', 390.00, FALSE, TRUE, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&q=80'),
(3, 1, 2, 'Dum Gosht Hyderabadi Biryani', 'Slow-cooked spiced lamb layered with saffron-infused basmati rice, served with raita and salan.', 480.00, FALSE, TRUE, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80'),
(4, 1, 2, 'Subz Dum Biryani', 'Farm fresh vegetables and paneer cooked on dum with long-grain basmati and royal spices.', 340.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=600&q=80'),
(5, 1, 5, 'Butter Chicken Delhi Style', 'Tandoor-charred chicken simmered in a velvety tomato, butter, and cashew gravy with kasuri methi.', 420.00, FALSE, TRUE, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80'),
(6, 1, 5, 'Dal Makhani Bukhara', 'Overnight slow-cooked black lentils finished with cultured butter and fresh cream.', 290.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80'),
(7, 1, 6, 'Gulab Jamun with Rabdi', 'Warm golden dumplings soaked in saffron syrup, served on a bed of chilled reduced milk rabdi.', 180.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80'),

-- Bella Italia Trattoria (Restaurant 2)
(8, 2, 3, 'Margherita Burrata Pizza', 'San Marzano tomato base, creamy whole Burrata cheese, fresh basil leaves, and extra virgin olive oil.', 490.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=80'),
(9, 2, 3, 'Spicy Pepperoni & Jalapeno', 'Smoked pork pepperoni, fiery pickled jalapenos, shredded mozzarella, and oregano on crispy sourdough.', 580.00, FALSE, TRUE, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80'),
(10, 2, 4, 'Truffle Mushroom Fettuccine', 'Handmade egg fettuccine tossed in a creamy parmesan emulsion, wild porcini mushrooms, and truffle oil.', 450.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&q=80'),
(11, 2, 4, 'Classic Spaghetti Carbonara', 'Al dente spaghetti tossed with crispy guanciale, egg yolk emulsion, black pepper, and Pecorino Romano.', 470.00, FALSE, TRUE, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80'),
(12, 2, 1, 'Crispy Garlic Bruschetta', 'Toasted sourdough baguette topped with heirloom tomatoes, garlic, extra virgin olive oil, and balsamic glaze.', 240.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80'),
(13, 2, 6, 'Classic Italian Tiramisu', 'Savoiardi ladyfingers soaked in espresso and Marsala, layered with whipped mascarpone cream and cocoa.', 280.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80'),

-- Dragon Wok Asian Kitchen (Restaurant 3)
(14, 3, 1, 'Crystal Vegetable Dim Sum', 'Translucent steamed dumplings filled with water chestnuts, shiitake mushrooms, and baby corn (6 pcs).', 310.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80'),
(15, 3, 1, 'Crispy Chili Garlic Prawns', 'Batter-fried king prawns tossed with bird eye chilies, crispy scallions, and roasted garlic flakes.', 480.00, FALSE, TRUE, 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80'),
(16, 3, 4, 'Fiery Dan Dan Noodles', 'Hand-pulled egg noodles with spicy Sichuan chili oil broth, sesame paste, bok choy, and scallions.', 360.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&q=80'),
(17, 3, 4, 'Wok-Tossed Chicken Hakka Noodles', 'Classic street-style noodles flash-fried in a roaring wok with shredded chicken, peppers, and soy.', 340.00, FALSE, TRUE, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80'),
(18, 3, 5, 'Kung Pao Chicken Bowls', 'Tender diced chicken wok-tossed with roasted peanuts, bell peppers, dried red chilies, and sweet soya.', 410.00, FALSE, TRUE, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80'),
(19, 3, 6, 'Matcha Green Tea Cheesecake', 'Japanese style velvety baked cheesecake infused with ceremonial grade Uji matcha.', 260.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80'),

-- The Green Bistro (Restaurant 4)
(20, 4, 1, 'Avocado & Edamame Tartine', 'Smashed Haas avocados, steamed edamame, microgreens, and toasted seeds on seeded sourdough.', 340.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80'),
(21, 4, 4, 'Mediterranean Quinoa Power Bowl', 'Organic tri-color quinoa, roasted chickpeas, Kalamata olives, feta, cherry tomatoes, and tahini dressing.', 380.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'),
(22, 4, 4, 'Grilled Salmon & Warm Barley Bowl', 'Norwegian salmon fillet grilled with herb butter, served over warm pearl barley and steamed greens.', 590.00, FALSE, TRUE, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80'),
(23, 4, 6, 'Cold Pressed Glow Juice', 'Pure cold pressed carrot, Valencia orange, ginger root, and turmeric with no added sugar.', 190.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80'),
(24, 4, 6, 'Acai Superberry Smoothie Bowl', 'Organic Brazilian acai puree blended with bananas, topped with chia seeds, granola, and berries.', 320.00, TRUE, TRUE, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&q=80');

-- ----------------------------------------------------------------------------
-- 6. Insert Orders
-- Realistic spread of historical delivered orders and active orders
-- ----------------------------------------------------------------------------
INSERT INTO orders (order_id, user_id, restaurant_id, delivery_address_id, delivery_address_snapshot, order_status, subtotal, tax_amount, delivery_fee, discount_amount, total_amount, special_instructions, order_date, delivered_at) VALUES
-- Order 1: Delivered Indian Dinner for John Doe
(1, 4, 1, 1, 'Flat 402, Sunshine Heights, Park Street Road, Mumbai, Maharashtra - 400001 (Near City Mall)', 'DELIVERED', 800.00, 40.00, 50.00, 0.00, 890.00, 'Please make the biryani medium spicy.', '2026-10-15 19:30:00', '2026-10-15 20:15:00'),

-- Order 2: Delivered Italian Feast for Priya Sharma
(2, 5, 2, 3, 'House No. 12B, Rose Villa, Indiranagar 100ft Road, Bangalore, Karnataka - 560038 (Behind Cafe Coffee Day)', 'DELIVERED', 1070.00, 53.50, 40.00, 100.00, 1063.50, 'Extra oregano and chili flakes packets please.', '2026-10-18 20:10:00', '2026-10-18 20:55:00'),

-- Order 3: Delivered Asian Dinner for Alex Kumar
(3, 6, 3, 5, 'Plot 88, Sector 15, CBD Belapur, Navi Mumbai, Maharashtra - 400614 (Near Sector Park)', 'DELIVERED', 790.00, 39.50, 60.00, 50.00, 839.50, 'Provide extra chopsticks.', '2026-10-20 21:00:00', '2026-10-20 21:42:00'),

-- Order 4: Delivered Healthy Lunch for Priya Sharma
(4, 5, 4, 3, 'House No. 12B, Rose Villa, Indiranagar 100ft Road, Bangalore, Karnataka - 560038', 'DELIVERED', 570.00, 28.50, 30.00, 0.00, 628.50, 'Pack dressing separately.', '2026-10-22 13:15:00', '2026-10-22 13:50:00'),

-- Order 5: Delivered Repeat Order for John Doe
(5, 4, 2, 2, 'Tech Park Phase 2, Tower B, 5th Floor, Whitefield, Bangalore, Karnataka - 560066', 'DELIVERED', 720.00, 36.00, 40.00, 50.00, 746.00, 'Deliver at reception desk.', '2026-10-25 12:45:00', '2026-10-25 13:25:00'),

-- Order 6: Order currently Out for Delivery
(6, 4, 1, 1, 'Flat 402, Sunshine Heights, Park Street Road, Mumbai, Maharashtra - 400001', 'OUT_FOR_DELIVERY', 710.00, 35.50, 50.00, 0.00, 795.50, 'Ring doorbell twice.', '2026-10-29 21:30:00', NULL),

-- Order 7: Order currently Preparing in Kitchen
(7, 6, 3, 6, 'Studio 14, High Point Residency, Bandra West, Mumbai, Maharashtra - 400050', 'PREPARING', 820.00, 41.00, 50.00, 0.00, 911.00, 'Less spicy.', '2026-10-29 22:00:00', NULL),

-- Order 8: Order recently Confirmed
(8, 5, 2, 4, 'Apartment 703, Lakeview Enclave, Koramangala 4th Block, Bangalore, Karnataka - 560034', 'CONFIRMED', 490.00, 24.50, 40.00, 0.00, 554.50, 'Cut pizza into 8 slices.', '2026-10-29 22:15:00', NULL),

-- Order 9: Order Pending confirmation
(9, 4, 4, 1, 'Flat 402, Sunshine Heights, Park Street Road, Mumbai, Maharashtra - 400001', 'PENDING', 510.00, 25.50, 40.00, 0.00, 575.50, 'Fresh cold juices only.', '2026-10-29 22:30:00', NULL),

-- Order 10: Cancelled Order
(10, 6, 1, 5, 'Plot 88, Sector 15, CBD Belapur, Navi Mumbai, Maharashtra - 400614', 'CANCELLED', 320.00, 16.00, 50.00, 0.00, 386.00, 'Cancelled by customer before preparation.', '2026-10-26 19:00:00', NULL);

-- ----------------------------------------------------------------------------
-- 7. Insert Order Items (with frozen historical unit prices)
-- ----------------------------------------------------------------------------
INSERT INTO order_items (order_item_id, order_id, item_id, item_name_snapshot, unit_price, quantity, item_subtotal, notes) VALUES
-- Items for Order 1 (Spice Symphony)
(1, 1, 1, 'Paneer Tikka Angaare', 320.00, 1, 320.00, 'Extra mint chutney'),
(2, 1, 3, 'Dum Gosht Hyderabadi Biryani', 480.00, 1, 480.00, 'Well done'),

-- Items for Order 2 (Bella Italia)
(3, 2, 8, 'Margherita Burrata Pizza', 490.00, 1, 490.00, 'Crispy crust'),
(4, 2, 11, 'Classic Spaghetti Carbonara', 470.00, 1, 470.00, NULL),
(5, 2, 13, 'Classic Italian Tiramisu', 110.00, 1, 110.00, 'Extra cocoa powder'),

-- Items for Order 3 (Dragon Wok)
(6, 3, 14, 'Crystal Vegetable Dim Sum', 310.00, 1, 310.00, NULL),
(7, 3, 15, 'Crispy Chili Garlic Prawns', 480.00, 1, 480.00, 'Spicy dip'),

-- Items for Order 4 (The Green Bistro)
(8, 4, 21, 'Mediterranean Quinoa Power Bowl', 380.00, 1, 380.00, 'No olives'),
(9, 4, 23, 'Cold Pressed Glow Juice', 190.00, 1, 190.00, NULL),

-- Items for Order 5 (Bella Italia)
(10, 5, 9, 'Spicy Pepperoni & Jalapeno', 480.00, 1, 480.00, NULL),
(11, 5, 12, 'Crispy Garlic Bruschetta', 240.00, 1, 240.00, NULL),

-- Items for Order 6 (Spice Symphony)
(12, 6, 2, 'Murgh Malai Kebab', 390.00, 1, 390.00, NULL),
(13, 6, 1, 'Paneer Tikka Angaare', 320.00, 1, 320.00, NULL),

-- Items for Order 7 (Dragon Wok)
(14, 7, 18, 'Kung Pao Chicken Bowls', 410.00, 2, 820.00, 'Add extra peanuts'),

-- Items for Order 8 (Bella Italia)
(15, 8, 8, 'Margherita Burrata Pizza', 490.00, 1, 490.00, NULL),

-- Items for Order 9 (The Green Bistro)
(16, 9, 23, 'Cold Pressed Glow Juice', 190.00, 1, 190.00, NULL),
(17, 9, 24, 'Acai Superberry Smoothie Bowl', 320.00, 1, 320.00, 'Extra granola'),

-- Items for Order 10 (Spice Symphony - Cancelled)
(18, 10, 1, 'Paneer Tikka Angaare', 320.00, 1, 320.00, NULL);

-- ----------------------------------------------------------------------------
-- 8. Insert Payments
-- Decoupled financial states with unique transaction references
-- ----------------------------------------------------------------------------
INSERT INTO payments (payment_id, order_id, transaction_reference, payment_method, payment_status, amount, payment_date, notes) VALUES
(1, 1, 'TXN_20261015_00192', 'UPI', 'COMPLETED', 890.00, '2026-10-15 19:30:15', 'Paid via GooglePay UPI ref #82739102'),
(2, 2, 'TXN_20261018_00881', 'CREDIT_CARD', 'COMPLETED', 1063.50, '2026-10-18 20:10:45', 'Visa ending in 4242 Auth code: 99128'),
(3, 3, 'TXN_20261020_00452', 'DEBIT_CARD', 'COMPLETED', 839.50, '2026-10-20 21:00:22', 'Mastercard ending in 1188'),
(4, 4, 'TXN_20261022_00673', 'UPI', 'COMPLETED', 628.50, '2026-10-22 13:15:30', 'Paid via PhonePe UPI ref #3892718'),
(5, 5, 'TXN_20261025_00912', 'NET_BANKING', 'COMPLETED', 746.00, '2026-10-25 12:45:50', 'HDFC Bank Netbanking #998273'),
(6, 6, 'TXN_20261029_00114', 'CASH_ON_DELIVERY', 'PENDING', 795.50, '2026-10-29 21:30:05', 'Cash to be collected upon delivery'),
(7, 7, 'TXN_20261029_00115', 'UPI', 'COMPLETED', 911.00, '2026-10-29 22:00:30', 'UPI transaction verified'),
(8, 8, 'TXN_20261029_00116', 'CREDIT_CARD', 'COMPLETED', 554.50, '2026-10-29 22:15:40', 'Amex card tokenized payment'),
(9, 9, 'TXN_20261029_00117', 'UPI', 'PENDING', 575.50, '2026-10-29 22:30:00', 'Payment session awaiting customer PIN'),
(10, 10, 'TXN_20261026_00784', 'UPI', 'REFUNDED', 386.00, '2026-10-26 19:00:10', 'Refund initiated automatically after cancellation');

-- ----------------------------------------------------------------------------
-- 9. Insert Reviews
-- Trigger automatically computes and updates restaurant rating_avg and total_reviews
-- ----------------------------------------------------------------------------
INSERT INTO reviews (review_id, user_id, restaurant_id, order_id, rating, comment, created_at) VALUES
(1, 4, 1, 1, 5, 'The Dum Gosht Biryani was heavenly! Meat was falling off the bone and the tandoori paneer was super soft. Delivery was right on time.', '2026-10-15 20:30:00'),
(2, 5, 2, 2, 5, 'Authentic wood-fired taste on the Burrata pizza! Loved the tiramisu packaging as well. Will definitely reorder soon.', '2026-10-18 21:10:00'),
(3, 6, 3, 3, 4, 'Crispy garlic prawns were delicious and full of flavor. Dim sums were fresh, though a bit more dipping sauce would be great.', '2026-10-20 22:00:00'),
(4, 5, 4, 4, 5, 'Fresh, crunchy quinoa bowl. Truly guilt-free and nourishing lunch. Cold pressed juice was super refreshing.', '2026-10-22 14:10:00'),
(5, 4, 2, 5, 4, 'Great pepperoni pizza for our office lunch. Came warm and neatly packed.', '2026-10-25 13:45:00');

