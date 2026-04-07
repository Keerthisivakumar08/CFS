const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getDb } = require('../models/db');

const router = express.Router();

// Get feedback (admin sees all, users see their own)
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();

  const baseQuery = `
    SELECT f.*, u.email as user_email, c.name as category_name
    FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN categories c ON f.category_id = c.id
  `;

  console.log('Fetching feedback for user:', req.user.email, 'Role:', req.user.role);
  const query = baseQuery + ' ORDER BY f.created_at DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('DB error during GET:', err);
      return res.status(500).json({ error: 'DB error' });
    }
    console.log('Returning feedback count:', rows.length);
    res.json(rows);
  });
});

// Create feedback
router.post('/', authenticateToken, [
  body('category_id').optional({ checkFalsy: true }),
  body('rating').custom((value) => {
    const r = parseInt(value);
    return r >= 1 && r <= 10;
  }).withMessage('Rating must be between 1 and 10'),
  body('comment').optional({ checkFalsy: true }).trim(),
  body('discovery_source').optional({ checkFalsy: true }).trim(),
  body('emoji').optional({ checkFalsy: true }).trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { category_id, rating, comment, discovery_source, emoji } = req.body;
  const db = getDb();

  db.run(
    'INSERT INTO feedback (user_id, category_id, rating, comment, discovery_source, emoji) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, category_id || null, rating, comment || null, discovery_source || null, emoji || null],
    function(err) {
      if (err) {
        console.error('DB Insert Error:', err);
        return res.status(500).json({ error: 'Failed to submit feedback', details: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Feedback submitted' });
    }
  );
});

module.exports = router;
