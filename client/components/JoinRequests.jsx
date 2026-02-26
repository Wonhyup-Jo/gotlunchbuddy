import React, { useState, useEffect } from 'react';
import * as api from '../api.js';

export default function JoinRequests({ token, teamId, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState('');

  const load = async () => {
    try {
      const data = await api.getJoinRequests(token, teamId);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [teamId]);

  const handleApprove = async (user_id) => {
    try {
      await api.approveJoinRequest(token, teamId, user_id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (user_id) => {
    try {
      await api.rejectJoinRequest(token, teamId, user_id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateInvite = async () => {
    try {
      const data = await api.createInvite(token, teamId);
      setInviteToken(data.invite_token);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Join Requests</h3>
        <button style={styles.closeBtn} onClick={onClose}>Back</button>
      </div>

      <button style={styles.inviteBtn} onClick={handleCreateInvite}>
        Generate Invite Link
      </button>
      {inviteToken && (
        <div style={styles.inviteBox}>
          <span style={{ fontSize: 11, wordBreak: 'break-all' }}>{inviteToken}</span>
          <button
            style={styles.copyBtn}
            onClick={() => navigator.clipboard.writeText(inviteToken)}
          >
            Copy
          </button>
        </div>
      )}

      {loading ? (
        <div style={styles.empty}>Loading...</div>
      ) : requests.length === 0 ? (
        <div style={styles.empty}>No pending requests</div>
      ) : (
        <div style={styles.list}>
          {requests.map((r) => (
            <div key={r.user_id} style={styles.row}>
              <span style={styles.userId}>{r.user_id}</span>
              <span style={styles.time}>
                {new Date(r.requested_at).toLocaleDateString()}
              </span>
              <button style={styles.approveBtn} onClick={() => handleApprove(r.user_id)}>
                Approve
              </button>
              <button style={styles.rejectBtn} onClick={() => handleReject(r.user_id)}>
                Reject
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 12, height: '100%', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, color: '#333' },
  closeBtn: {
    padding: '4px 10px', borderRadius: 4, border: '1px solid #ccc',
    background: '#fff', fontSize: 12, cursor: 'pointer',
  },
  inviteBtn: {
    width: '100%', padding: '8px 0', borderRadius: 6, border: 'none',
    background: '#3498db', color: '#fff', fontSize: 12, cursor: 'pointer',
    marginBottom: 8,
  },
  inviteBox: {
    display: 'flex', gap: 6, alignItems: 'center', padding: 8,
    background: '#ecf0f1', borderRadius: 6, marginBottom: 12,
  },
  copyBtn: {
    padding: '2px 8px', borderRadius: 4, border: 'none',
    background: '#e67e22', color: '#fff', fontSize: 11, cursor: 'pointer',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
    background: '#fff', borderRadius: 6, border: '1px solid #eee',
  },
  userId: { flex: 1, fontSize: 13, fontWeight: 600 },
  time: { fontSize: 11, color: '#999' },
  approveBtn: {
    padding: '3px 8px', borderRadius: 4, border: 'none',
    background: '#27ae60', color: '#fff', fontSize: 11, cursor: 'pointer',
  },
  rejectBtn: {
    padding: '3px 8px', borderRadius: 4, border: 'none',
    background: '#e74c3c', color: '#fff', fontSize: 11, cursor: 'pointer',
  },
  empty: { textAlign: 'center', color: '#999', fontSize: 13, marginTop: 20 },
};
