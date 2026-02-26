const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

// GET /me
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await db('users').where('id', req.user.id).first();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user.id,
      avatar_config: JSON.parse(user.avatar_config || '{}'),
      created_at: user.created_at,
    });
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /me/avatar
router.patch('/avatar', authMiddleware, async (req, res) => {
  try {
    const { avatar_config } = req.body;
    if (!avatar_config) {
      return res.status(400).json({ error: 'avatar_config is required' });
    }
    await db('users')
      .where('id', req.user.id)
      .update({
        avatar_config: JSON.stringify(avatar_config),
        updated_at: db.fn.now(),
      });
    res.json({ avatar_config });
  } catch (err) {
    console.error('PATCH /me/avatar error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
