require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { init } = require('./models/db');
const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Client Feedback System API v1.0',
    endpoints: {
      login: '/api/auth/login',
      categories: '/api/feedback/categories',
      feedback: '/api/feedback'
    },
    defaultAdmin: 'admin@feedback.com / admin123'
  });
});

init();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('📱 Open feedback_system/index.html to test');
});

module.exports = server;

