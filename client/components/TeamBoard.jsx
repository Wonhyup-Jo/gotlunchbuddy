import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../api.js';
import { AvatarPreview } from './AvatarEditor.jsx';
import StatusInput from './StatusInput.jsx';
import JoinRequests from './JoinRequests.jsx';
import { useSSE } from '../hooks/useSSE.js';

export default function TeamBoard({ token, user, activeTeams, onLogout }) {
  const [selectedTeamId, setSelectedTeamId] = useState(activeTeams[0]?.team_id || '');
  const [members, setMembers] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [myStatus, setMyStatus] = useState('');
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [myRole, setMyRole] = useState('member');

  const loadTeamData = useCallback(async () => {
    if (!selectedTeamId || !token) return;
    try {
      const [membersData, statusesData] = await Promise.all([
        api.getTeamMembers(token, selectedTeamId),
        api.getTeamStatuses(token, selectedTeamId),
      ]);
      setMembers(membersData);

      const statusMap = {};
      statusesData.forEach((s) => { statusMap[s.user_id] = s; });
      setStatuses(statusMap);

      const me = membersData.find((m) => m.user_id === user?.id);
      setMyRole(me?.role || 'member');
      setMyStatus(statusMap[user?.id]?.text || '');
    } catch (err) {
      console.error('Load team data error:', err);
    }
  }, [selectedTeamId, token, user]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  // SSE handlers
  const sseHandlers = {
    onStatusUpdated: (data) => {
      if (data.team_id === selectedTeamId) {
        setStatuses((prev) => ({
          ...prev,
          [data.user_id]: { text: data.text, updated_at: data.updated_at },
        }));
      }
    },
    onJoinApproved: () => loadTeamData(),
    onJoinRejected: () => {},
    onJoinRequested: () => {},
  };

  useSSE(selectedTeamId, token, sseHandlers);

  const selectedTeam = activeTeams.find((t) => t.team_id === selectedTeamId);

  if (showJoinRequests) {
    return (
      <JoinRequests
        token={token}
        teamId={selectedTeamId}
        onClose={() => setShowJoinRequests(false)}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <select
          style={styles.teamSelect}
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
        >
          {activeTeams.map((t) => (
            <option key={t.team_id} value={t.team_id}>
              {t.team_name}
            </option>
          ))}
        </select>
        <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </div>

      {/* Operator tools */}
      {myRole === 'operator' && (
        <button style={styles.operatorBtn} onClick={() => setShowJoinRequests(true)}>
          Manage Join Requests
        </button>
      )}

      {/* My status */}
      <StatusInput
        token={token}
        teamId={selectedTeamId}
        currentText={myStatus}
        onUpdated={(text) => setMyStatus(text)}
      />

      {/* Members grid */}
      <div style={styles.grid}>
        {members.map((m) => {
          const status = statuses[m.user_id];
          const isMe = m.user_id === user?.id;
          return (
            <div
              key={m.user_id}
              style={{
                ...styles.card,
                ...(isMe ? styles.cardMe : {}),
              }}
            >
              <AvatarPreview config={m.avatar_config} size={44} />
              <div style={styles.cardInfo}>
                <div style={styles.cardName}>
                  {m.user_id}
                  {m.role === 'operator' && <span style={styles.opBadge}>OP</span>}
                </div>
                <div style={styles.cardStatus}>
                  {status?.text || '(no status)'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 12, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  teamSelect: {
    padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc',
    fontSize: 13, outline: 'none', flex: 1, marginRight: 8,
  },
  logoutBtn: {
    padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc',
    background: '#fff', fontSize: 12, cursor: 'pointer', color: '#e74c3c',
  },
  operatorBtn: {
    width: '100%', padding: '6px 0', borderRadius: 6, border: 'none',
    background: '#9b59b6', color: '#fff', fontSize: 12, cursor: 'pointer',
    marginBottom: 4,
  },
  grid: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' },
  card: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
    background: '#fff', borderRadius: 8, border: '1px solid #eee',
  },
  cardMe: { borderColor: '#e67e22', borderWidth: 2 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 },
  opBadge: {
    fontSize: 9, background: '#9b59b6', color: '#fff',
    padding: '1px 4px', borderRadius: 4,
  },
  cardStatus: {
    fontSize: 12, color: '#666', marginTop: 2,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
};
