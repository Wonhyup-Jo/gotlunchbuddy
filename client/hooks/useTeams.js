import { useState, useCallback } from 'react';
import * as api from '../api.js';

export function useTeams(token) {
  const [myTeams, setMyTeams] = useState([]);

  const loadMyTeams = useCallback(async () => {
    if (!token) return;
    const data = await api.getMyTeams(token);
    setMyTeams(data);
  }, [token]);

  const activeTeams = myTeams.filter((t) => t.status === 'active');
  const pendingTeams = myTeams.filter((t) => t.status === 'pending');

  return { myTeams, activeTeams, pendingTeams, loadMyTeams };
}
