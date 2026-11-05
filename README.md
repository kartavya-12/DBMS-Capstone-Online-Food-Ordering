# FoodExpress — Online Food Ordering System
### B.Tech Computer Science & Engineering — DBMS Capstone Project

A complete, production-grade, relational database-driven web application demonstrating core Database Management System (DBMS) concepts: **3NF Normalization**, **ACID Transactions**, **Historical Price Immutability**, **Database Triggers**, **Operational Views**, **Composite Indexing**, and **Role-Based Access Control (RBAC)**.

---

## 1. Technology Stack

* **Database:** MySQL 8.0+ (InnoDB Storage Engine for strict ACID transactions and foreign keys).
* **Backend:** Node.js, Express.js, `mysql2/promise` (connection pooling & parameterized queries), `bcryptjs`, `jsonwebtoken`.
* **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons.
* **Database Management:** MySQL Workbench & MySQL CLI.

---

## 2. Project Architecture & Structure

```
dbms capstone/
├── database/
│   ├── schema.sql              # MySQL DDL: 9 tables, constraints, triggers & 4 views
│   ├── seed.sql                # Realistic demonstration data (Users, Menus, Orders, Reviews)
│   └── queries.sql             # 23 Practical & Analytical SQL Queries
├── backend/
│   ├── .env.example            # Environment variables template
│   ├── .env                    # Local database credentials
│   ├── server.js               # Express API entry point
│   ├── test-runner.js          # Automated integration & security test runner
│   └── src/
│       ├── config/db.js        # mysql2/promise connection pool
│       ├── middleware/         # auth.js, rbac.js, errorHandler.js
│       ├── controllers/        # auth, address, restaurant, menu, order, payment, review, admin
│       └── routes/             # RESTful API route definitions
├── frontend/
│   ├── index.html              # HTML shell with Google Plus Jakarta Sans font
│   ├── vite.config.js          # Vite config with API proxy
│   ├── tailwind.config.js      # Custom food-brand styling
│   └── src/
│       ├── context/            # AuthContext, CartContext (Single-restaurant invariant)
│       ├── components/         # Navbar, Footer, RestaurantCard, MenuItemCard, ConflictModal
│       └── pages/              # Customer pages + Protected Admin Suite (/admin)
├── docs/
│   ├── project-report.md       # Complete Academic B.Tech Project Report & DFDs
│   ├── data-dictionary.md      # Exhaustive column specifications for all 9 tables
│   ├── api-documentation.md    # REST API endpoints, request payloads & responses
│   ├── viva-preparation.md     # DBMS Viva Questions & Detailed Answers
│   ├── testing-checklist.md    # Test cases matrix & manual testing flow
│   └── architecture-and-schema.md # Phase 1 requirements, architecture & ER diagram
└── README.md
```

---

## 3. Quick Start Guide

### Step 1: Database Setup (MySQL 8.0)
You can run this via **MySQL Workbench** or from your terminal.

#### Option A: Using MySQL Workbench (GUI)
1. Open MySQL Workbench and connect to your local MySQL instance (`localhost:3306`).
2. Go to **File $\to$ Open SQL Script...** and select `database/schema.sql`.
3. Click the **Execute** button (⚡ icon). This creates `food_ordering_db`, all 9 tables, constraints, triggers, and views.
4. Next, open and execute `database/seed.sql` to populate sample users, restaurants, dishes, orders, and reviews.

#### Option B: Using Command Line
```powershell
cd "c:\code\dbms capstone"

# Execute schema DDL (enter your MySQL password when prompted)
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database/schema.sql

# Execute seed data
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database/seed.sql
```

---

### Step 2: Backend Setup & Execution
1. Navigate to `backend/` and configure your MySQL password in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=food_ordering_db
   JWT_SECRET=super_secret_jwt_capstone_key_replace_in_production_2026
   CLIENT_URL=http://localhost:5173
   ```
2. Start the Express API server:
   ```powershell
   cd "c:\code\dbms capstone\backend"
   npm run dev
   # Or: npm start
   ```
3. Verify server health: Open `http://localhost:5000/api/health` in your browser.

---

### Step 3: Frontend Setup & Execution
In a new terminal window:
```powershell
cd "c:\code\dbms capstone\frontend"
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 4. Demonstration Accounts & 1-Click Login

All seeded accounts have the default demonstration password: **`Password123!`**
*(The login page includes 1-click auto-fill buttons for quick evaluator testing)*:

| Role | Email Address | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@foodexpress.com` | `Password123!` | System overview KPIs, all orders monitor, restaurant & menu CRUD, user accounts governance, sales reports. |
| **Restaurant Manager** | `manager.spice@foodexpress.com` | `Password123!` | Manages menu availability, prices, and kitchen order pipeline for *Spice Symphony*. |
| **Customer (John)** | `john.doe@example.com` | `Password123!` | Full ordering flow, cart management, address book, live order tracking, verified review submission. |
| **Customer (Priya)** | `priya.sharma@example.com` | `Password123!` | Multi-address testing, vegetarian filtering, order history. |

---

## 5. Key DBMS Concepts Demonstrated

1. **Third Normal Form (3NF)**: Eliminates insertion, deletion, and update anomalies across 9 normalized entities.
2. **Historical Snapshot Pattern (Intentional Denormalization)**: `order_items.unit_price` freezes item prices at purchase time so future menu price changes do not corrupt financial invoices.
3. **ACID Transactions**: Order placement executes within a multi-statement `START TRANSACTION ... COMMIT / ROLLBACK` block on InnoDB.
4. **Single-Restaurant Cart Invariant**: Prevents mixed-restaurant checkouts both on client and server to guarantee delivery feasibility.
5. **Database Triggers**: `trg_after_review_insert`, `trg_after_review_update`, and `trg_after_review_delete` automatically recalculate restaurant ratings in real-time.
6. **Analytical Views**: `vw_order_details`, `vw_restaurant_performance`, `vw_popular_menu_items`, and `vw_customer_spending_summary`.
7. **B-Tree Composite Indexes**: Query optimization demonstrated via `EXPLAIN`.
8. **SQL Injection Defense**: 100% parameterized queries using MySQL prepared statements.

---

## 6. Complete Documentation Index

* 📖 **[Project Report & DFDs](file:///c:/code/dbms%20capstone/docs/project-report.md)**: Full academic B.Tech CSE project documentation.
* 🎓 **[DBMS Viva Questions & Answers](file:///c:/code/dbms%20capstone/docs/viva-preparation.md)**: Interview & practical exam Q&A.
* 📋 **[Testing Checklist & Test Cases](file:///c:/code/dbms%20capstone/docs/testing-checklist.md)**: Comprehensive test matrix.
* 📚 **[Data Dictionary](file:///c:/code/dbms%20capstone/docs/data-dictionary.md)**: Column specifications, data types, and constraints for all 9 tables.
* 🌐 **[REST API Documentation](file:///c:/code/dbms%20capstone/docs/api-documentation.md)**: Endpoints, authentication, request payloads, and responses.
* 📐 **[Architecture & ER Diagram](file:///c:/code/dbms%20capstone/docs/architecture-and-schema.md)**: Phase 1 design blueprint.

