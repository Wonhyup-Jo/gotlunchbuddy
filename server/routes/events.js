const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../auth');
const { addConnection } = require('../sse');

const router = express.Router();

// GET /events/stream?team_id=&token=
router.get('/stream', async (req, res) => {
  try {
    const { team_id, token } = req.query;
    if (!team_id || !token) {
      return res.status(400).json({ error: 'team_id and token are required' });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify active membership
    const membership = await db('memberships')
      .where({ team_id, user_id: decoded.id, status: 'active' })
      .first();
    if (!membership) {
      return res.status(403).json({ error: 'Not an active member of this team' });
    }

    // Setup SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('\n');

    addConnection(team_id, res);
  } catch (err) {
    console.error('SSE stream error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
