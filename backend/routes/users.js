const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getDb } = require('../models/db');

const router = express.Router();

// GET all users (admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  db.all('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(users);
  });
});

// DELETE user (admin only, not self)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  db.get('SELECT id FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete self' });
    }
    
    db.run('DELETE FROM clients WHERE created_by = ?', [req.params.id], function(err) {
      if (err) console.error('Error deleting user clients:', err);
    });
    
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete user' });
      }
      res.json({ message: `User ${req.params.id} deleted (clients also removed)` });
    });
  });
});

module.exports = router;

