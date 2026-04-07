require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./models/db');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const userRoutes = require('./routes/users');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5000;
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredOrigins])];

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Client System API Running! Visit /api/auth for endpoints.' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Initialize DB
db.init();

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

