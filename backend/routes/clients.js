const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { getDb } = require('../models/db');

const router = express.Router();

// GET all clients (user sees own, admin sees all)
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const query = req.user.role === 'admin' 
    ? 'SELECT * FROM clients ORDER BY created_at DESC'
    : 'SELECT * FROM clients WHERE created_by = ? ORDER BY created_at DESC';
    
  const params = req.user.role === 'admin' ? [] : [req.user.id];
  
  db.all(query, params, (err, clients) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch clients' });
    }
    res.json(clients);
  });
});

// GET client by ID
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const query = req.user.role === 'admin'
    ? 'SELECT * FROM clients WHERE id = ?'
    : 'SELECT * FROM clients WHERE id = ? AND created_by = ?';
  const params = req.user.role === 'admin' ? [req.params.id] : [req.params.id, req.user.id];
  
  db.get(query, params, (err, client) => {
    if (err || !client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  });
});

// CREATE client
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Name required'),
  body('email').optional().isEmail().withMessage('Valid email'),
  body('phone').optional(),
  body('status').optional().isIn(['active', 'inactive'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, status } = req.body;
  const db = getDb();

  db.run(
    'INSERT INTO clients (name, email, phone, status, created_by) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, status || 'active', req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create client' });
      }
      res.status(201).json({ id: this.lastID, message: 'Client created' });
    }
  );
});

// UPDATE client
router.put('/:id', authenticateToken, [
  body('name').notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional(),
  body('status').optional().isIn(['active', 'inactive'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, status } = req.body;
  const db = getDb();
  const query = req.user.role === 'admin'
    ? 'UPDATE clients SET name = ?, email = ?, phone = ?, status = ? WHERE id = ?'
    : 'UPDATE clients SET name = ?, email = ?, phone = ?, status = ? WHERE id = ? AND created_by = ?';
  const params = req.user.role === 'admin' 
    ? [name, email, phone, status || 'active', req.params.id]
    : [name, email, phone, status || 'active', req.params.id, req.user.id];

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client updated' });
  });
});

// DELETE client
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const query = req.user.role === 'admin'
    ? 'DELETE FROM clients WHERE id = ?'
    : 'DELETE FROM clients WHERE id = ? AND created_by = ?';
  const params = req.user.role === 'admin' ? [req.params.id] : [req.params.id, req.user.id];

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted' });
  });
});

module.exports = router;

