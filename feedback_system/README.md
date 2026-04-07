# Client Feedback System

## Backend
1. cd feedback_system/backend
2. npm install (deps: express sqlite3 etc auto)
3. npm start (port 3001, auto DB feedback.db with admin@feedback.com/admin123)

**API Docs:**
- POST /api/auth/register {email, password}
- POST /api/auth/login {email, password}
- GET /api/feedback/categories
- GET/POST /api/feedback (auth Bearer token)

## Frontend (Simple HTML)dark pa
index.html with login, submit feedback form.

App ready for college project with auth, DB, CRUD feedback.

