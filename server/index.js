const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const teamsRoutes = require('./routes/teams');
const invitesRoutes = require('./routes/invites');
const joinRequestsRoutes = require('./routes/joinRequests');
const statusRoutes = require('./routes/status');
const eventsRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/me', userRoutes);
app.use('/teams', teamsRoutes);
app.use('/invites', invitesRoutes);
app.use('/teams', joinRequestsRoutes);
app.use('/status', statusRoutes);
app.use('/events', eventsRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
