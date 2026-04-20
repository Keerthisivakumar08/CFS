const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { getDb } = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  db.all(
    'SELECT food_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error('Failed to fetch favorites:', err.message);
        return res.status(500).json({ error: 'Failed to fetch favorites' });
      }
      res.json(rows.map((row) => row.food_id));
    }
  );
});

router.post(
  '/',
  authenticateToken,
  [
    body('food_id')
      .isInt({ min: 1 })
      .withMessage('food_id must be a positive integer')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDb();
    const foodId = Number(req.body.food_id);

    db.run(
      'INSERT OR IGNORE INTO favorites (user_id, food_id) VALUES (?, ?)',
      [req.user.id, foodId],
      function onInsert(err) {
        if (err) {
          console.error('Failed to save favorite:', err.message);
          return res.status(500).json({ error: 'Failed to save favorite' });
        }

        res.status(201).json({
          message: this.changes ? 'Added to favorites' : 'Already in favorites',
          food_id: foodId
        });
      }
    );
  }
);

router.delete(
  '/:foodId',
  authenticateToken,
  [param('foodId').isInt({ min: 1 }).withMessage('food_id must be a positive integer')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDb();
    const foodId = Number(req.params.foodId);

    db.run(
      'DELETE FROM favorites WHERE user_id = ? AND food_id = ?',
      [req.user.id, foodId],
      function onDelete(err) {
        if (err) {
          console.error('Failed to remove favorite:', err.message);
          return res.status(500).json({ error: 'Failed to remove favorite' });
        }

        res.json({
          message: this.changes ? 'Removed from favorites' : 'Favorite not found',
          food_id: foodId
        });
      }
    );
  }
);

module.exports = router;
