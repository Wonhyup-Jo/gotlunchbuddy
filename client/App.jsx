import React, { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import TeamGateway from './components/TeamGateway.jsx';
import TeamBoard from './components/TeamBoard.jsx';
import MiniWidget from './components/MiniWidget.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useTeams } from './hooks/useTeams.js';

export default function App() {
  const { token, user, login, register, logout, updateAvatar, loadUser } = useAuth();
  const { myTeams, activeTeams, loadMyTeams } = useTeams(token);
  const [screen, setScreen] = useState('login');
  const [widgetMode, setWidgetMode] = useState('board');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onModeChanged((mode) => setWidgetMode(mode));
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadUser();
      loadMyTeams();
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setScreen('login');
    } else if (activeTeams.length === 0) {
      setScreen('gateway');
    } else {
      setScreen('board');
    }
  }, [token, activeTeams.length]);

  if (screen === 'login') {
    return <Login onLogin={login} onGoRegister={() => setScreen('register')} />;
  }
  if (screen === 'register') {
    return <Register onRegister={register} onGoLogin={() => setScreen('login')} />;
  }
  if (screen === 'gateway') {
    return <TeamGateway token={token} onTeamJoined={loadMyTeams} />;
  }

  if (widgetMode === 'mini') {
    return <MiniWidget user={user} activeTeams={activeTeams} token={token} />;
  }

  return (
    <TeamBoard
      token={token}
      user={user}
      activeTeams={activeTeams}
      onLogout={logout}
      onUpdateAvatar={updateAvatar}
    />
  );
}
