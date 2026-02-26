import React, { useState } from 'react';
import * as api from '../api.js';

export default function StatusInput({ token, teamId, currentText, onUpdated }) {
  const [text, setText] = useState(currentText || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateStatus(token, teamId, text);
      onUpdated?.(text);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <div style={styles.container}>
      <input
        style={styles.input}
        placeholder="What's your lunch plan? (max 40)"
        maxLength={40}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button style={styles.btn} onClick={handleSave} disabled={saving}>
        {saving ? '...' : 'Save'}
      </button>
      <span style={styles.count}>{text.length}/40</span>
    </div>
  );
}

const styles = {
  container: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' },
  input: {
    flex: 1, padding: '6px 10px', borderRadius: 6,
    border: '1px solid #ccc', fontSize: 13, outline: 'none',
  },
  btn: {
    padding: '6px 12px', borderRadius: 6, border: 'none',
    background: '#e67e22', color: '#fff', fontSize: 12,
    cursor: 'pointer', fontWeight: 600,
  },
  count: { fontSize: 10, color: '#999', whiteSpace: 'nowrap' },
};
