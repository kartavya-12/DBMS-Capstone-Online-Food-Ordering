# Deploying Online Food Ordering System on Render (100% Free)

This project is fully optimized for **Render**. You can deploy it as a **Single Unified Full-Stack Service** (Frontend + Backend running on 1 single Free Render service) or as **Two Services** (Backend API + Frontend Static Site).

---

## Prerequisites: Free Cloud MySQL Database

Render does not offer a free MySQL add-on (they only offer PostgreSQL). Therefore, create a free MySQL 8 database first on **[Aiven](https://aiven.io/)** or **[TiDB Cloud](https://tidb.cloud/)** (both are 100% free forever, no credit card required):

### Setting up Free MySQL on Aiven (2 Minutes):
1. Sign up for free at **[aiven.io](https://aiven.io/)**.
2. Click **Create Service** $\to$ **MySQL** $\to$ Select the **Free Plan**.
3. Choose a region and click **Create Service**.
4. Once created, note down your connection details:
   - **Host**
   - **Port**
   - **User** (`avnadmin`)
   - **Password**
   - **Database Name** (`defaultdb` or `food_ordering_db`)
5. Initialize the tables & seed data on your cloud database:
   From your local terminal, run:
   ```bash
   cd backend
   # Set the cloud credentials in backend/.env temporarily, then run:
   npm run db:init
   ```
   *(This script automatically runs `schema.sql` and `seed.sql` on your cloud database!)*

---

## Method 1: Deploy as a Unified Full-Stack Service on Render (Recommended)

This hosts both the Express API and the React frontend on **1 single free Render Web Service**.

1. Go to **[dashboard.render.com](https://dashboard.render.com/)** and log in with GitHub.
2. Click **New +** $\to$ **Web Service**.
3. Select your repository: `kartavya-12/DBMS-Capstone-Online-Food-Ordering`.
4. Configure the settings:
   - **Name:** `foodexpress-app`
   - **Language / Runtime:** `Node`
   - **Branch:** `main`
   - **Root Directory:** *(leave blank / root)*
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `DB_HOST` = `<your-aiven-or-cloud-db-host>`
   - `DB_PORT` = `<your-cloud-db-port>` (e.g. 12345 or 3306)
   - `DB_USER` = `<your-cloud-db-username>`
   - `DB_PASSWORD` = `<your-cloud-db-password>`
   - `DB_NAME` = `food_ordering_db` *(or defaultdb)*
   - `DB_SSL` = `true`
   - `JWT_SECRET` = `any_secure_random_string_here_2026`
   - `CLIENT_URL` = `*`
6. Click **Deploy Web Service**!

Render will install dependencies, build the React frontend, and boot Express serving both the API and frontend at your Render URL (e.g., `https://foodexpress-app.onrender.com`).

---

## Method 2: Deploy Backend & Frontend Separately on Render

If you prefer two separate services on Render:

### Service A: Backend Web Service
1. **New +** $\to$ **Web Service**.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add the same database environment variables listed above.

### Service B: Frontend Static Site
1. **New +** $\to$ **Static Site**.
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Publish Directory:** `dist`
5. **Environment Variable:**
   - `VITE_API_URL` = `https://your-backend-service-name.onrender.com/api`
6. Under **Redirects/Rewrites**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
