import React, { useState, useEffect } from 'react';
import { AvatarPreview } from './AvatarEditor.jsx';
import * as api from '../api.js';

export default function MiniWidget({ user, activeTeams, token }) {
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    if (!activeTeams.length || !token) return;
    const teamId = activeTeams[0].team_id;
    api.getTeamStatuses(token, teamId).then((data) => {
      const mine = data.find((s) => s.user_id === user?.id);
      if (mine) setStatusText(mine.text);
    }).catch(() => {});
  }, [activeTeams, token, user]);

  const handleClick = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleMode();
    }
  };

  return (
    <div style={styles.container} onClick={handleClick}>
      <AvatarPreview config={user?.avatar_config} size={48} />
      <div style={styles.info}>
        <div style={styles.name}>{user?.id || '...'}</div>
        <div style={styles.status}>{statusText || 'Click to expand'}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
    height: '100vh', cursor: 'pointer', background: '#fff',
    borderRadius: 8, userSelect: 'none',
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 13, fontWeight: 600, color: '#333' },
  status: {
    fontSize: 11, color: '#666', marginTop: 2,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
};
