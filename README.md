# Billing System In React JS

This **Billing System** is a comprehensive, user-friendly application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It allows businesses to manage their billing operations efficiently, track transactions, and generate invoices. The system provides an intuitive interface for both users and administrators to interact with.

## Features :
 - **Invoice Generation**: Create and manage invoices with ease.
 - **Transaction History**: View and track past transactions.
 - **Admin Dashboard**: Access detailed reports and manage transactions.

## Tech Stack :
 - **Frontend**: React.js (Vite.js)
 - **Backend**: Node.js, Express.js
 - **Database**: Supabase (Postgres)

## 📂 Project Structure
```
Billing-System/
├── frontend/        # Frontend-related files (UI, components, etc.)
│   ├── assets/      # Static files (CSS, JS, Images)
│   ├── components/  # Reusable UI components (header, footer, etc.)
│   ├── views/       # Frontend views (home, login, dashboard, etc.)
│   └── scripts/     # Core frontend functionalities (product handling, billing logic)
├── backend/         # Backend-related files (APIs, server, database)
│   ├── config/      # Configuration files (database connection, settings)
│   ├── controller/  # Functions to handle requests and interact with the database
│   ├── models/      # Placeholder models (Supabase used directly)
│   ├── routes/      # API routes for different functionalities
│   ├── scripts/     # Database initialization SQL (Supabase)
│   └── lib/         # Supabase client configuration
└── admin/           # Admin panel-related files (admin dashboard, user management)
    ├── assets/      # Static files (CSS, JS, Images)
    ├── components/  # Reusable UI components (admin header, footer, etc.)
    ├── pages/       # Admin pages
    └── scripts/     # Admin panel functionalities (CRUD operations, admin logic)
```

## Backend Health, Port, and Configuration

- Default backend port is 3001 (override via PORT env).
- Health endpoint: `GET /health` returns `{ status, port, supabaseEnv, warnings }`.
- Non-sensitive config: `GET /api/meta/config`.
- Router pings: `GET /api/product/ping`, `GET /api/billinghistory/ping`.
- DB check: `POST /api/admin/db/check` to verify required tables exist; returns hints if missing.
- Required envs: `SUPABASE_URL`, `SUPABASE_KEY`. See `backend/.env.example`.
- Initialize tables by running SQL in `backend/scripts/supabase_init.sql` inside Supabase.

## **Project Setup**

### **Prerequisites**
 - Node.js (v18+ recommended)
 - A Supabase project
 - npm or yarn

### **Clone the repository:**
```bash
git clone https://github.com/nameissakthi/Billing-System.git
```

### **Navigate to the project directory**
```bash
  cd Billing-System
```

### Install dependencies for frontend and backend separately
**Tip:** To efficiently install dependencies for both frontend and backend simultaneously, use split terminals.

**Install frontend dependencies**
```bash
cd Billing-System/frontend
npm install
```

**Install admin dependencies**
```bash
cd Billing-System/admin
npm install
```

**Install backend dependencies**
```bash
cd Billing-System/backend
npm install
```

### Environment Variables
**Backend**
- Create a `.env` file in the `backend` directory.
- Add the following variables with appropriate values

```bash
# Server
PORT=3001

# Supabase
SUPABASE_URL="https://<your-project>.supabase.co"
SUPABASE_KEY="<service-role-or-anon-key>"
```

**Frontend & Admin**
- Create a `.env` file in the respective directories
- Add the following variable:
```bash
# Backend URL (adjust if needed)
VITE_BACKEND_URL="http://localhost:3001"
```

**Important**
- Replace placeholders with your actual values.
- Exclude the `.env` file from version control to protect sensitive information.

**Important:**
- **Separate terminals**: Run the commands in separate terminal windows or use `split terminal` to avoid conflicts.
- **Nodemon optional**: You can run the backend with `npm run server`.

#### Start the backend server
- Navigate to the `backend` directory: `cd backend`
- Start the server: `npm run start` or `npm run server`
- You should see logs indicating the server is running on port 3001 and whether Supabase env vars are present.

#### Start the frontend server:
- Navigate to the `frontend` directory: `cd frontend`
- Start the server: `npm run dev`

#### Start the admin server:
- Navigate to the `admin` directory: `cd admin`
- Start the server: `npm run dev`

## **Bonus**
Don't forget to star the repository and share your feedback!✨

## Authors
- [Sakthivel](https://github.com/nameissakthi)

## License
This project is licensed under the [MIT License](LICENSE).