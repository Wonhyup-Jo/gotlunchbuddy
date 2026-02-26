const BASE = 'http://localhost:3001';

async function request(path, options = {}) {
  const { token, method = 'GET', body } = options;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Auth
export const register = (user_id, password, avatar_config) =>
  request('/auth/register', { method: 'POST', body: { user_id, password, avatar_config } });

export const login = (user_id, password) =>
  request('/auth/login', { method: 'POST', body: { user_id, password } });

export const getMe = (token) => request('/me', { token });

export const updateAvatar = (token, avatar_config) =>
  request('/me/avatar', { token, method: 'PATCH', body: { avatar_config } });

// Teams
export const createTeam = (token, team_name) =>
  request('/teams', { token, method: 'POST', body: { team_name } });

export const getMyTeams = (token) => request('/teams/mine', { token });

export const searchTeams = (token, q) => request(`/teams/search?q=${encodeURIComponent(q)}`, { token });

export const getTeamMembers = (token, team_id) =>
  request(`/teams/${team_id}/members`, { token });

export const getTeamStatuses = (token, team_id) =>
  request(`/teams/${team_id}/status`, { token });

// Join requests
export const requestJoinTeam = (token, team_id) =>
  request(`/teams/${team_id}/join-requests`, { token, method: 'POST' });

export const requestJoinByInvite = (token, invite_token) =>
  request(`/invites/${invite_token}/join-requests`, { token, method: 'POST' });

export const getJoinRequests = (token, team_id) =>
  request(`/teams/${team_id}/join-requests`, { token });

export const approveJoinRequest = (token, team_id, user_id) =>
  request(`/teams/${team_id}/join-requests/${user_id}/approve`, { token, method: 'POST' });

export const rejectJoinRequest = (token, team_id, user_id) =>
  request(`/teams/${team_id}/join-requests/${user_id}/reject`, { token, method: 'POST' });

// Invites
export const createInvite = (token, team_id) =>
  request(`/teams/${team_id}/invites`, { token, method: 'POST' });

// Status
export const updateStatus = (token, team_id, text) =>
  request('/status', { token, method: 'PUT', body: { team_id, text } });

// SSE URL
export const sseURL = (team_id, token) =>
  `${BASE}/events/stream?team_id=${team_id}&token=${token}`;
