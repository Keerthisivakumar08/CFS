const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../models/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role } = req.body;
  const allowedRoles = ['user', 'admin'];
  const userRole = allowedRoles.includes(role) ? role : 'user';
  const db = getDb();

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Hash error' });
    }
    
    db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hash, userRole], function(err) {
      if (err) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(201).json({ message: 'User registered', userId: this.lastID });
    });
  });
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const db = getDb();

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (err, isValid) => {
      if (err || !isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ 
        token, 
        user: { id: user.id, email: user.email, role: user.role } 
      });
    });
  });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

module.exports = router;

