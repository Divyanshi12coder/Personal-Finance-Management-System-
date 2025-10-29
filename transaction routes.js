// routes/transactions.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/add', async (req, res) => {
  const { userId, amount, category, type } = req.body;
  await db.query('INSERT INTO transactions (user_id, amount, category, type) VALUES (?, ?, ?, ?)', [userId, amount, category, type]);
  res.send('Transaction added');
});

router.get('/:userId', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM transactions WHERE user_id = ?', [req.params.userId]);
  res.json(rows);
});

module.exports = router;