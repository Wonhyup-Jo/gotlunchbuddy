import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import TeamGateway from './components/TeamGateway.jsx';
import TeamBoard from './components/TeamBoard.jsx';
import FabBubble from './components/FabBubble.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useTeams } from './hooks/useTeams.js';
import * as api from './api.js';

export default function App() {
  const { token, user, login, register, logout, updateAvatar, loadUser } = useAuth();
  const { myTeams, activeTeams, loadMyTeams } = useTeams(token);
  const [screen, setScreen] = useState('login');
  const [panelOpen, setPanelOpen] = useState(false);
  const [myStatusText, setMyStatusText] = useState('');

  // Listen for panel toggle from Electron (hotkey / tray)
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onPanelToggled((expanded) => setPanelOpen(expanded));
    }
  }, []);

  // Load user and teams on token change
  useEffect(() => {
    if (token) {
      loadUser();
      loadMyTeams();
    }
  }, [token]);

  // Determine screen based on auth state
  useEffect(() => {
    if (!token) {
      setScreen('login');
    } else if (activeTeams.length === 0) {
      setScreen('gateway');
    } else {
      setScreen('board');
    }
  }, [token, activeTeams.length]);

  // Load my status for bubble tooltip
  useEffect(() => {
    if (!token || !activeTeams.length || !user) return;
    const teamId = activeTeams[0].team_id;
    api.getTeamStatuses(token, teamId).then((data) => {
      const mine = data.find((s) => s.user_id === user.id);
      if (mine) setMyStatusText(mine.text);
    }).catch(() => {});
  }, [token, activeTeams.length, user]);

  // Click-through for transparent areas
  useEffect(() => {
    if (!window.electronAPI) return;
    const handler = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || el === document.documentElement || el === document.body || el.id === 'root') {
        window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
      } else {
        window.electronAPI.setIgnoreMouseEvents(false);
      }
    };
    document.addEventListener('mousemove', handler);
    return () => document.removeEventListener('mousemove', handler);
  }, []);

  // Close panel on window blur (outside click)
  useEffect(() => {
    if (!panelOpen) return;
    const handleBlur = () => {
      window.electronAPI?.collapsePanel();
      setPanelOpen(false);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [panelOpen]);

  const togglePanel = useCallback(() => {
    if (panelOpen) {
      window.electronAPI?.collapsePanel();
      setPanelOpen(false);
    } else {
      window.electronAPI?.expandPanel();
      setPanelOpen(true);
    }
  }, [panelOpen]);

  // Panel content
  let panelContent;
  if (screen === 'login') {
    panelContent = <Login onLogin={login} onGoRegister={() => setScreen('register')} />;
  } else if (screen === 'register') {
    panelContent = <Register onRegister={register} onGoLogin={() => setScreen('login')} />;
  } else if (screen === 'gateway') {
    panelContent = <TeamGateway token={token} onTeamJoined={loadMyTeams} />;
  } else {
    panelContent = (
      <TeamBoard
        token={token}
        user={user}
        activeTeams={activeTeams}
        onLogout={logout}
        onUpdateAvatar={updateAvatar}
      />
    );
  }

  if (!panelOpen) {
    return (
      <div style={styles.collapsedRoot}>
        <FabBubble
          user={user}
          statusText={myStatusText}
          onToggle={togglePanel}
          expanded={false}
        />
      </div>
    );
  }

  return (
    <div style={styles.expandedRoot}>
      <div style={styles.panel}>
        <div style={styles.panelTopBar}>
          {token && (
            <button style={styles.logoutBtn} onClick={logout} title="Logout">
              Logout
            </button>
          )}
          <button
            style={styles.closeBtn}
            onClick={() => window.close()}
            title="Quit"
          >
            X
          </button>
        </div>
        {panelContent}
      </div>
      <div style={styles.bubbleRow}>
        <FabBubble
          user={user}
          statusText={myStatusText}
          onToggle={togglePanel}
          expanded={true}
        />
      </div>
    </div>
  );
}

const styles = {
  collapsedRoot: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  expandedRoot: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  panel: {
    flex: 1,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  panelTopBar: {
    position: 'absolute',
    top: 8,
    right: 8,
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    zIndex: 20,
  },
  logoutBtn: {
    height: 22,
    padding: '0 8px',
    borderRadius: 11,
    border: 'none',
    background: 'rgba(0,0,0,0.08)',
    color: '#e74c3c',
    fontSize: 10,
    fontWeight: 600,
    cursor: 'pointer',
    lineHeight: 1,
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0,0,0,0.08)',
    color: '#666',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  bubbleRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 12,
  },
};
