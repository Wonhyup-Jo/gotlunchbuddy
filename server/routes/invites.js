const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../auth');
const { broadcast } = require('../sse');

const router = express.Router();

// POST /teams/:team_id/invites — operator creates invite link
router.post('/teams/:team_id/invites', authMiddleware, async (req, res) => {
  try {
    const { team_id } = req.params;
    // Verify operator
    const membership = await db('memberships')
      .where({ team_id, user_id: req.user.id, role: 'operator', status: 'active' })
      .first();
    if (!membership) {
      return res.status(403).json({ error: 'Only operators can create invite links' });
    }

    const invite_token = uuidv4();
    await db('invite_links').insert({
      invite_token,
      team_id,
      created_by: req.user.id,
    });

    res.status(201).json({ invite_token, team_id });
  } catch (err) {
    console.error('POST invites error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /invites/:invite_token/join-requests — join via invite link
router.post('/:invite_token/join-requests', authMiddleware, async (req, res) => {
  try {
    const { invite_token } = req.params;
    const invite = await db('invite_links')
      .where({ invite_token, is_active: true })
      .first();
    if (!invite) {
      return res.status(404).json({ error: 'Invalid or expired invite link' });
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Invite link has expired' });
    }

    const team_id = invite.team_id;

    // Check max 3 active teams
    const activeCount = await db('memberships')
      .where({ user_id: req.user.id, status: 'active' })
      .count('* as cnt')
      .first();
    if (activeCount.cnt >= 3) {
      return res.status(400).json({ error: 'Maximum 3 active teams allowed' });
    }

    // Check existing membership
    const existing = await db('memberships')
      .where({ team_id, user_id: req.user.id })
      .first();
    if (existing) {
      if (existing.status === 'active') {
        return res.status(409).json({ error: 'Already a member of this team' });
      }
      if (existing.status === 'pending') {
        return res.status(409).json({ error: 'Already have a pending request' });
      }
      // rejected → allow re-request
      await db('memberships')
        .where({ team_id, user_id: req.user.id })
        .update({ status: 'pending', decided_at: null, requested_at: db.fn.now() });
    } else {
      await db('memberships').insert({
        team_id,
        user_id: req.user.id,
        role: 'member',
        status: 'pending',
      });
    }

    broadcast(team_id, 'join_requested', {
      team_id,
      user_id: req.user.id,
      requested_at: new Date().toISOString(),
    });

    res.status(201).json({ team_id, status: 'pending' });
  } catch (err) {
    console.error('POST invite join-request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
