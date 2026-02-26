const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');
const { broadcast } = require('../sse');

const router = express.Router();

// PUT /status — upsert my status for a team
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { team_id, text } = req.body;
    if (!team_id) return res.status(400).json({ error: 'team_id is required' });

    const statusText = (text || '').slice(0, 40);

    // Verify active membership
    const membership = await db('memberships')
      .where({ team_id, user_id: req.user.id, status: 'active' })
      .first();
    if (!membership) {
      return res.status(403).json({ error: 'Not an active member of this team' });
    }

    // Upsert
    const existing = await db('statuses')
      .where({ team_id, user_id: req.user.id })
      .first();
    if (existing) {
      await db('statuses')
        .where({ team_id, user_id: req.user.id })
        .update({ text: statusText, updated_at: db.fn.now() });
    } else {
      await db('statuses').insert({
        team_id,
        user_id: req.user.id,
        text: statusText,
      });
    }

    const now = new Date().toISOString();
    broadcast(team_id, 'status_updated', {
      team_id,
      user_id: req.user.id,
      text: statusText,
      updated_at: now,
    });

    res.json({ team_id, user_id: req.user.id, text: statusText, updated_at: now });
  } catch (err) {
    console.error('PUT /status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
