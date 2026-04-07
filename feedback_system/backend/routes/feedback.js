const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { getDb } = require('../models/db');

const router = express.Router();

// GET categories (public)
router.get('/categories', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(categories);
  });
});

// GET feedback (auth)
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const query = req.user.role === 'admin'
    ? `SELECT f.*, u.email as user_email, c.name as category_name 
       FROM feedback f 
       JOIN users u ON f.user_id = u.id 
       JOIN categories c ON f.category_id = c.id 
       ORDER BY f.created_at DESC`
    : `SELECT f.*, c.name as category_name 
       FROM feedback f 
       JOIN categories c ON f.category_id = c.id 
       WHERE f.user_id = ? 
       ORDER BY f.created_at DESC`;

  const params = req.user.role === 'admin' ? [] : [req.user.id];

  db.all(query, params, (err, feedback) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(feedback);
  });
});

// POST feedback
router.post('/', authenticate, [
  body('category_id').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { category_id, rating, comment } = req.body;
  const db = getDb();

  db.run(
    'INSERT INTO feedback (user_id, category_id, rating, comment) VALUES (?, ?, ?, ?)',
    [req.user.id, category_id, rating, comment || null],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to submit feedback' });
      res.status(201).json({ id: this.lastID, message: 'Feedback submitted' });
    }
  );
});

module.exports = router;

