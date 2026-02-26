// SSE connection manager — team-based broadcast
const connections = new Map(); // team_id -> Set<res>

function addConnection(teamId, res) {
  if (!connections.has(teamId)) {
    connections.set(teamId, new Set());
  }
  connections.get(teamId).add(res);
  res.on('close', () => removeConnection(teamId, res));
}

function removeConnection(teamId, res) {
  const set = connections.get(teamId);
  if (set) {
    set.delete(res);
    if (set.size === 0) connections.delete(teamId);
  }
}

function broadcast(teamId, event, data) {
  const set = connections.get(teamId);
  if (!set) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    res.write(payload);
  }
}

// Heartbeat every 30s
setInterval(() => {
  for (const [, set] of connections) {
    for (const res of set) {
      res.write(': heartbeat\n\n');
    }
  }
}, 30000);

module.exports = { addConnection, broadcast };
