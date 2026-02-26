const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');
const { broadcast } = require('../sse');

const router = express.Router();

// POST /teams/:team_id/join-requests — request to join (no invite link)
router.post('/:team_id/join-requests', authMiddleware, async (req, res) => {
  try {
    const { team_id } = req.params;

    // Check team exists
    const team = await db('teams').where({ team_id }).first();
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Max 3 active teams
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
        return res.status(409).json({ error: 'Already a member' });
      }
      if (existing.status === 'pending') {
        return res.status(409).json({ error: 'Already have a pending request' });
      }
      // rejected → re-request
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
    console.error('POST join-request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /teams/:team_id/join-requests — operator: list pending
router.get('/:team_id/join-requests', authMiddleware, async (req, res) => {
  try {
    const { team_id } = req.params;
    // Verify operator
    const membership = await db('memberships')
      .where({ team_id, user_id: req.user.id, role: 'operator', status: 'active' })
      .first();
    if (!membership) {
      return res.status(403).json({ error: 'Only operators can view join requests' });
    }

    const pending = await db('memberships')
      .where({ team_id, status: 'pending' })
      .select('user_id', 'requested_at');
    res.json(pending);
  } catch (err) {
    console.error('GET join-requests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /teams/:team_id/join-requests/:user_id/approve
router.post('/:team_id/join-requests/:user_id/approve', authMiddleware, async (req, res) => {
  try {
    const { team_id, user_id } = req.params;
    // Verify operator
    const opMembership = await db('memberships')
      .where({ team_id, user_id: req.user.id, role: 'operator', status: 'active' })
      .first();
    if (!opMembership) {
      return res.status(403).json({ error: 'Only operators can approve requests' });
    }

    const updated = await db('memberships')
      .where({ team_id, user_id, status: 'pending' })
      .update({ status: 'active', decided_at: db.fn.now() });

    if (!updated) {
      return res.status(404).json({ error: 'No pending request found' });
    }

    broadcast(team_id, 'join_approved', {
      team_id,
      user_id,
      decided_at: new Date().toISOString(),
    });

    res.json({ team_id, user_id, status: 'active' });
  } catch (err) {
    console.error('POST approve error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /teams/:team_id/join-requests/:user_id/reject
router.post('/:team_id/join-requests/:user_id/reject', authMiddleware, async (req, res) => {
  try {
    const { team_id, user_id } = req.params;
    // Verify operator
    const opMembership = await db('memberships')
      .where({ team_id, user_id: req.user.id, role: 'operator', status: 'active' })
      .first();
    if (!opMembership) {
      return res.status(403).json({ error: 'Only operators can reject requests' });
    }

    const updated = await db('memberships')
      .where({ team_id, user_id, status: 'pending' })
      .update({ status: 'rejected', decided_at: db.fn.now() });

    if (!updated) {
      return res.status(404).json({ error: 'No pending request found' });
    }

    broadcast(team_id, 'join_rejected', {
      team_id,
      user_id,
      decided_at: new Date().toISOString(),
    });

    res.json({ team_id, user_id, status: 'rejected' });
  } catch (err) {
    console.error('POST reject error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
