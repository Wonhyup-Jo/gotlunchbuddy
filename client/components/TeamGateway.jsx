import React, { useState } from 'react';
import * as api from '../api.js';

export default function TeamGateway({ token, onTeamJoined }) {
  const [tab, setTab] = useState('create');

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Join or Create a Team</h2>
      <p style={styles.subtitle}>You need at least one active team to continue.</p>
      <div style={styles.tabs}>
        {['create', 'invite', 'search'].map((t) => (
          <button
            key={t}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t === 'create' ? 'Create' : t === 'invite' ? 'Join by Link' : 'Search'}
          </button>
        ))}
      </div>
      {tab === 'create' && <CreateTab token={token} onDone={onTeamJoined} />}
      {tab === 'invite' && <InviteTab token={token} onDone={onTeamJoined} />}
      {tab === 'search' && <SearchTab token={token} onDone={onTeamJoined} />}
    </div>
  );
}

function CreateTab({ token, onDone }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.createTeam(token, name);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} style={styles.form}>
      <input
        style={styles.input}
        placeholder="Team Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && <div style={styles.error}>{error}</div>}
      <button style={styles.btn} type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Team'}
      </button>
    </form>
  );
}

function InviteTab({ token, onDone }) {
  const [inviteToken, setInviteToken] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      // Extract token from URL or raw token
      let tok = inviteToken.trim();
      const match = tok.match(/invites\/([a-f0-9-]+)/);
      if (match) tok = match[1];

      await api.requestJoinByInvite(token, tok);
      setMsg('Join request sent! Waiting for operator approval.');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} style={styles.form}>
      <input
        style={styles.input}
        placeholder="Paste invite link or token"
        value={inviteToken}
        onChange={(e) => setInviteToken(e.target.value)}
      />
      {error && <div style={styles.error}>{error}</div>}
      {msg && <div style={styles.msg}>{msg}</div>}
      <button style={styles.btn} type="submit" disabled={loading}>
        {loading ? 'Requesting...' : 'Request to Join'}
      </button>
    </form>
  );
}

function SearchTab({ token, onDone }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.searchTeams(token, query);
      setResults(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoin = async (team_id) => {
    setError('');
    setMsg('');
    try {
      await api.requestJoinTeam(token, team_id);
      setMsg('Join request sent!');
      onDone();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.form}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6 }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="Search team name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button style={{ ...styles.btn, padding: '8px 14px' }} type="submit">
          Search
        </button>
      </form>
      {error && <div style={styles.error}>{error}</div>}
      {msg && <div style={styles.msg}>{msg}</div>}
      <div style={styles.results}>
        {results.map((t) => (
          <div key={t.team_id} style={styles.resultRow}>
            <span style={{ flex: 1, fontSize: 13 }}>{t.team_name}</span>
            <button style={styles.joinBtn} onClick={() => handleJoin(t.team_id)}>
              Join
            </button>
          </div>
        ))}
        {results.length === 0 && query && (
          <div style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>No teams found</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', padding: 20,
  },
  title: { fontSize: 18, marginBottom: 4, color: '#e67e22' },
  subtitle: { fontSize: 12, color: '#999', marginBottom: 16 },
  tabs: { display: 'flex', gap: 4, marginBottom: 16 },
  tab: {
    padding: '6px 14px', borderRadius: 14, border: '1px solid #ddd',
    background: '#fff', fontSize: 12, cursor: 'pointer',
  },
  tabActive: { background: '#e67e22', color: '#fff', borderColor: '#e67e22' },
  form: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 },
  input: {
    padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc',
    fontSize: 13, outline: 'none',
  },
  btn: {
    padding: '8px 0', borderRadius: 6, border: 'none',
    background: '#e67e22', color: '#fff', fontSize: 13,
    cursor: 'pointer', fontWeight: 600,
  },
  error: { color: '#e74c3c', fontSize: 12, textAlign: 'center' },
  msg: { color: '#27ae60', fontSize: 12, textAlign: 'center' },
  results: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  resultRow: {
    display: 'flex', alignItems: 'center', padding: '6px 10px',
    background: '#fff', borderRadius: 6, border: '1px solid #eee',
  },
  joinBtn: {
    padding: '4px 10px', borderRadius: 4, border: 'none',
    background: '#3498db', color: '#fff', fontSize: 11, cursor: 'pointer',
  },
};
