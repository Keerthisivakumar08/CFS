# Client Feedback Management System

A simple, beginner-friendly web application for college mini projects. Designed using PHP, MySQL, HTML, and Bootstrap.

## Features
- **User Authentication**: Login and Registration for regular users and administrators.
- **Client Side**: Secure portal for users to submit feedback (ratings 1-5 and comments).
- **Admin Side**: A protected dashboard for administrators to view and track all client feedback in a tabular format.
- **Responsive UI**: Clean, modern, and mobile-friendly interface built with Bootstrap 5.

## Requirements
- XAMPP / WAMP / MAMP (or any local server with PHP and MySQL support)

## Installation Instructions (Step-by-Step for XAMPP)

1. **Start XAMPP Server**
   - Open your XAMPP Control Panel.
   - Click "Start" next to **Apache** and **MySQL**.

2. **Copy the Project**
   - Place this entire project folder (`client_system`) into the `htdocs` directory of XAMPP.
   - Typically, it is located at `C:\xampp\htdocs\client_system`.

3. **Set up the Database**
   - Open your web browser and go to `http://localhost/phpmyadmin/`.
   - Click on the "Import" tab at the top.
   - Click "Choose File" and select the `database.sql` file provided in this folder.
   - Click "Import" or "Go" at the bottom of the page. This will automatically create the `client_feedback_db` database, tables, and sample users.

4. **Run the Project**
   - Open your web browser and navigate to `http://localhost/client_system/`.
   - You will see the login screen.

## Demo Accounts

**Demo Administrator Account:**
- **Username:** `admin`
- **Password:** `admin123`

**Demo Client Account:**
- **Username:** `client1`
- **Password:** `user123`

*You can also create a new account by clicking "Register here" on the login screen.*

## File Structure Description
- `database.sql`: SQL script to create the DB, tables, and insert dummy data.
- `db.php`: Database connection configuration.
- `index.php`: User login page.
- `register.php`: Registration page with role selection.
- `submit_feedback.php`: Form page for clients to submit feedback.
- `admin_dashboard.php`: Administrator dashboard to view all feedback.
- `logout.php`: Session termination script.
- `style.css`: Custom CSS for minor styling tweaks.

## React + Node Deployment

This repo also includes a deployable React frontend in `frontend/` and a Node/Express backend in `backend/`.

### Frontend on Vercel

1. Import the repo into Vercel.
2. Set the Root Directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `build`
5. Add environment variable:
   - `REACT_APP_API_URL=https://your-railway-backend.up.railway.app/api`

The file `frontend/vercel.json` is already added so React routes like `/login` and `/admin-dashboard` work after refresh.

### Backend on Railway

1. Create a new Railway service from this repo.
2. Set the Root Directory to `backend`.
3. Railway will run `npm start` using `backend/railway.toml`.
4. Add environment variables:
   - `JWT_SECRET=your-secret-key`
   - `CORS_ORIGIN=https://your-vercel-project.vercel.app`
   - `SQLITE_DB_PATH=/data/db.sqlite`

### Important Note About SQLite

The backend uses SQLite. On Railway, the database file must be stored on a mounted persistent volume such as `/data/db.sqlite`. If you do not attach a volume, your data can be lost on redeploy or restart.
