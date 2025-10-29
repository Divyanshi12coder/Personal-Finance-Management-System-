// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).send('Invalid credentials');
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  res.json({ token });
};