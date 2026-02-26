import React from 'react';

const GENDERS = ['male', 'female'];
const SKIN_COLORS = ['#FFDBB4', '#C68642', '#8D5524', '#F1C27D'];
const ACCESSORIES = ['none', 'glasses', 'hat', 'headband'];
const HAIR_STYLES = ['short', 'long', 'buzz', 'ponytail'];

export default function AvatarEditor({ config, onChange }) {
  const c = config || { gender: 'male', skinColor: '#FFDBB4', accessory: 'none', hair: 'short' };

  const set = (key, val) => onChange({ ...c, [key]: val });

  return (
    <div style={styles.container}>
      <AvatarPreview config={c} size={64} />
      <div style={styles.row}>
        <label style={styles.label}>Gender</label>
        <div style={styles.options}>
          {GENDERS.map((g) => (
            <button
              key={g}
              style={{ ...styles.chip, ...(c.gender === g ? styles.chipActive : {}) }}
              onClick={() => set('gender', g)}
              type="button"
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div style={styles.row}>
        <label style={styles.label}>Skin</label>
        <div style={styles.options}>
          {SKIN_COLORS.map((sc) => (
            <button
              key={sc}
              style={{
                ...styles.colorChip,
                background: sc,
                ...(c.skinColor === sc ? { border: '2px solid #333' } : {}),
              }}
              onClick={() => set('skinColor', sc)}
              type="button"
            />
          ))}
        </div>
      </div>
      <div style={styles.row}>
        <label style={styles.label}>Hair</label>
        <div style={styles.options}>
          {HAIR_STYLES.map((h) => (
            <button
              key={h}
              style={{ ...styles.chip, ...(c.hair === h ? styles.chipActive : {}) }}
              onClick={() => set('hair', h)}
              type="button"
            >
              {h}
            </button>
          ))}
        </div>
      </div>
      <div style={styles.row}>
        <label style={styles.label}>Acc.</label>
        <div style={styles.options}>
          {ACCESSORIES.map((a) => (
            <button
              key={a}
              style={{ ...styles.chip, ...(c.accessory === a ? styles.chipActive : {}) }}
              onClick={() => set('accessory', a)}
              type="button"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AvatarPreview({ config, size = 40 }) {
  const c = config || {};
  const skinColor = c.skinColor || '#FFDBB4';
  const hair = c.hair || 'short';
  const accessory = c.accessory || 'none';
  const gender = c.gender || 'male';

  const hairColor = '#4a3728';
  const r = size / 2;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {/* Head */}
      <circle cx="50" cy="55" r="35" fill={skinColor} />
      {/* Hair */}
      {hair === 'short' && (
        <ellipse cx="50" cy="30" rx="30" ry="18" fill={hairColor} />
      )}
      {hair === 'long' && (
        <>
          <ellipse cx="50" cy="30" rx="32" ry="20" fill={hairColor} />
          <rect x="20" y="30" width="16" height="45" rx="8" fill={hairColor} />
          <rect x="64" y="30" width="16" height="45" rx="8" fill={hairColor} />
        </>
      )}
      {hair === 'buzz' && (
        <ellipse cx="50" cy="32" rx="28" ry="14" fill={hairColor} opacity="0.6" />
      )}
      {hair === 'ponytail' && (
        <>
          <ellipse cx="50" cy="30" rx="30" ry="18" fill={hairColor} />
          <rect x="44" y="12" width="12" height="20" rx="6" fill={hairColor} />
        </>
      )}
      {/* Eyes */}
      <circle cx="40" cy="55" r="3" fill="#333" />
      <circle cx="60" cy="55" r="3" fill="#333" />
      {/* Mouth */}
      <path d="M42,68 Q50,75 58,68" stroke="#333" strokeWidth="2" fill="none" />
      {/* Accessories */}
      {accessory === 'glasses' && (
        <>
          <circle cx="40" cy="55" r="8" stroke="#333" strokeWidth="2" fill="none" />
          <circle cx="60" cy="55" r="8" stroke="#333" strokeWidth="2" fill="none" />
          <line x1="48" y1="55" x2="52" y2="55" stroke="#333" strokeWidth="2" />
        </>
      )}
      {accessory === 'hat' && (
        <>
          <rect x="22" y="20" width="56" height="8" rx="3" fill="#e67e22" />
          <rect x="30" y="8" width="40" height="16" rx="4" fill="#e67e22" />
        </>
      )}
      {accessory === 'headband' && (
        <rect x="20" y="32" width="60" height="5" rx="2" fill="#e74c3c" />
      )}
    </svg>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' },
  row: { display: 'flex', alignItems: 'center', gap: 8, width: '100%' },
  label: { fontSize: 11, fontWeight: 600, width: 40, color: '#666' },
  options: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  chip: {
    padding: '3px 8px', borderRadius: 10, border: '1px solid #ccc',
    background: '#fff', fontSize: 11, cursor: 'pointer',
  },
  chipActive: { background: '#e67e22', color: '#fff', borderColor: '#e67e22' },
  colorChip: {
    width: 22, height: 22, borderRadius: '50%', border: '2px solid transparent',
    cursor: 'pointer',
  },
};
