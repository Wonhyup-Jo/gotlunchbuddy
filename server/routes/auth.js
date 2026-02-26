const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken } = require('../auth');

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { user_id, password, avatar_config } = req.body;
    if (!user_id || !password) {
      return res.status(400).json({ error: 'user_id and password are required' });
    }
    if (user_id.length < 2 || user_id.length > 20) {
      return res.status(400).json({ error: 'user_id must be 2-20 characters' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const existing = await db('users').where('id', user_id).first();
    if (existing) {
      return res.status(409).json({ error: 'User ID already taken' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await db('users').insert({
      id: user_id,
      password_hash,
      avatar_config: JSON.stringify(avatar_config || {}),
    });

    const token = generateToken(user_id);
    res.status(201).json({ token, user: { id: user_id, avatar_config: avatar_config || {} } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { user_id, password } = req.body;
    if (!user_id || !password) {
      return res.status(400).json({ error: 'user_id and password are required' });
    }

    const user = await db('users').where('id', user_id).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user_id);
    res.json({
      token,
      user: { id: user.id, avatar_config: JSON.parse(user.avatar_config || '{}') },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
