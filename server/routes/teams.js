const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

// POST /teams — create team
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { team_name } = req.body;
    if (!team_name || team_name.trim().length === 0) {
      return res.status(400).json({ error: 'team_name is required' });
    }

    // Enforce max 3 active teams
    const activeCount = await db('memberships')
      .where({ user_id: req.user.id, status: 'active' })
      .count('* as cnt')
      .first();
    if (activeCount.cnt >= 3) {
      return res.status(400).json({ error: 'Maximum 3 active teams allowed' });
    }

    const team_id = uuidv4();
    await db('teams').insert({
      team_id,
      team_name: team_name.trim(),
      operator_user_id: req.user.id,
    });

    // Auto-add creator as operator + active
    await db('memberships').insert({
      team_id,
      user_id: req.user.id,
      role: 'operator',
      status: 'active',
    });

    res.status(201).json({ team_id, team_name: team_name.trim() });
  } catch (err) {
    console.error('POST /teams error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /teams/mine — my memberships
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const memberships = await db('memberships')
      .join('teams', 'memberships.team_id', 'teams.team_id')
      .where('memberships.user_id', req.user.id)
      .select(
        'teams.team_id',
        'teams.team_name',
        'memberships.role',
        'memberships.status',
        'memberships.requested_at'
      );
    res.json(memberships);
  } catch (err) {
    console.error('GET /teams/mine error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /teams/search?q=
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length === 0) {
      return res.json([]);
    }
    const teams = await db('teams')
      .where('team_name', 'like', `%${q}%`)
      .select('team_id', 'team_name', 'created_at')
      .limit(20);
    res.json(teams);
  } catch (err) {
    console.error('GET /teams/search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /teams/:team_id/members — get team members (active only)
router.get('/:team_id/members', authMiddleware, async (req, res) => {
  try {
    const { team_id } = req.params;
    // Verify caller is active member
    const myMembership = await db('memberships')
      .where({ team_id, user_id: req.user.id, status: 'active' })
      .first();
    if (!myMembership) {
      return res.status(403).json({ error: 'Not an active member of this team' });
    }

    const members = await db('memberships')
      .join('users', 'memberships.user_id', 'users.id')
      .where({ 'memberships.team_id': team_id, 'memberships.status': 'active' })
      .select(
        'users.id as user_id',
        'users.avatar_config',
        'memberships.role'
      );

    res.json(
      members.map((m) => ({
        ...m,
        avatar_config: JSON.parse(m.avatar_config || '{}'),
      }))
    );
  } catch (err) {
    console.error('GET /teams/:id/members error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /teams/:team_id/status — all member statuses
router.get('/:team_id/status', authMiddleware, async (req, res) => {
  try {
    const { team_id } = req.params;
    // Verify active membership
    const myMembership = await db('memberships')
      .where({ team_id, user_id: req.user.id, status: 'active' })
      .first();
    if (!myMembership) {
      return res.status(403).json({ error: 'Not an active member of this team' });
    }

    const statuses = await db('statuses')
      .join('memberships', function () {
        this.on('statuses.team_id', '=', 'memberships.team_id')
          .andOn('statuses.user_id', '=', 'memberships.user_id');
      })
      .where({ 'statuses.team_id': team_id, 'memberships.status': 'active' })
      .select('statuses.user_id', 'statuses.text', 'statuses.updated_at');

    res.json(statuses);
  } catch (err) {
    console.error('GET /teams/:id/status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
