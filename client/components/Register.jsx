import React, { useState } from 'react';
import AvatarEditor from './AvatarEditor.jsx';

export default function Register({ onRegister, onGoLogin }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [avatarConfig, setAvatarConfig] = useState({
    gender: 'male', skinColor: '#FFDBB4', accessory: 'none', hair: 'short',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onRegister(userId, password, avatarConfig);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Account</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="User ID (2-20 chars)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password (min 4 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AvatarEditor config={avatarConfig} onChange={setAvatarConfig} />
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <button style={styles.link} onClick={onGoLogin}>
        Back to Login
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%', padding: 20, overflowY: 'auto',
  },
  title: { fontSize: 20, marginBottom: 16, color: '#e67e22' },
  form: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 },
  input: {
    padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc',
    fontSize: 14, outline: 'none',
  },
  btn: {
    padding: '10px 0', borderRadius: 6, border: 'none',
    background: '#e67e22', color: '#fff', fontSize: 14,
    cursor: 'pointer', fontWeight: 600,
  },
  error: { color: '#e74c3c', fontSize: 12, textAlign: 'center' },
  link: {
    marginTop: 12, background: 'none', border: 'none',
    color: '#3498db', cursor: 'pointer', fontSize: 13,
  },
};
