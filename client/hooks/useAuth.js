import { useState, useCallback } from 'react';
import * as api from '../api.js';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const login = useCallback(async (user_id, password) => {
    const data = await api.login(user_id, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (user_id, password, avatar_config) => {
    const data = await api.register(user_id, password, avatar_config);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getMe(token);
      setUser(data);
    } catch {
      logout();
    }
  }, [token, logout]);

  const updateAvatar = useCallback(async (avatar_config) => {
    if (!token) return;
    await api.updateAvatar(token, avatar_config);
    setUser((u) => ({ ...u, avatar_config }));
  }, [token]);

  return { token, user, login, register, logout, updateAvatar, loadUser };
}
