import React, { useState } from 'react';

export default function Login({ onLogin, onGoRegister }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(userId, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>GotLunchBuddy</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button style={styles.link} onClick={onGoRegister}>
        Create Account
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', padding: 20,
  },
  title: { fontSize: 22, marginBottom: 24, color: '#e67e22' },
  form: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 260 },
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
