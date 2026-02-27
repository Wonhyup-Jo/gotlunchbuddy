import React, { useState, useRef, useCallback } from 'react';
import { AvatarPreview } from './AvatarEditor.jsx';

const MAX_VISIBLE = 8;

export default function FabBubble({ user, statusText, members, onToggle, expanded }) {
  const [hovered, setHovered] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, winX: 0, winY: 0, moved: false });

  const handleMouseDown = useCallback(async (e) => {
    if (expanded) return;
    e.preventDefault();
    const pos = window.electronAPI ? await window.electronAPI.getWindowPosition() : [0, 0];
    dragRef.current = {
      startX: e.screenX,
      startY: e.screenY,
      winX: pos[0],
      winY: pos[1],
      moved: false,
    };

    const onMove = (ev) => {
      const dx = ev.screenX - dragRef.current.startX;
      const dy = ev.screenY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }
      if (dragRef.current.moved && window.electronAPI) {
        window.electronAPI.setWindowPosition(
          dragRef.current.winX + dx,
          dragRef.current.winY + dy
        );
      }
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (!dragRef.current.moved) {
        onToggle?.();
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [expanded, onToggle]);

  const handleClick = useCallback(() => {
    if (expanded) onToggle?.();
  }, [expanded, onToggle]);

  // Expanded mode: single bubble at bottom-right
  if (expanded) {
    return (
      <div style={styles.container}>
        <div
          style={{
            ...styles.bubble,
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            boxShadow: hovered
              ? '0 6px 24px rgba(230,126,34,0.4)'
              : '0 4px 16px rgba(0,0,0,0.18)',
          }}
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {user ? (
            <AvatarPreview config={user.avatar_config} size={66} />
          ) : (
            <div style={styles.placeholder}>?</div>
          )}
        </div>
      </div>
    );
  }

  // Collapsed mode: team cluster or single bubble
  const showCluster = members && members.length > 0;

  if (!showCluster) {
    return (
      <div
        style={styles.container}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && statusText && (
          <div style={styles.tooltip}>
            {statusText}
            <div style={styles.tooltipArrow} />
          </div>
        )}
        <div
          style={{
            ...styles.bubble,
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            boxShadow: hovered
              ? '0 6px 24px rgba(230,126,34,0.4)'
              : '0 4px 16px rgba(0,0,0,0.18)',
          }}
          onMouseDown={handleMouseDown}
        >
          {user ? (
            <AvatarPreview config={user.avatar_config} size={66} />
          ) : (
            <div style={styles.placeholder}>?</div>
          )}
        </div>
      </div>
    );
  }

  // Cluster mode: all team members in a pill with status/avatar/id columns
  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - MAX_VISIBLE;

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.cluster,
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
          boxShadow: hovered
            ? '0 6px 20px rgba(230,126,34,0.3)'
            : '0 3px 12px rgba(0,0,0,0.12)',
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {visible.map((m) => {
          const isMe = m.user_id === user?.id;
          return (
            <div key={m.user_id} style={styles.memberColumn}>
              <div style={styles.memberStatus}>
                {m.statusText || '\u00A0'}
              </div>
              <div
                style={{
                  ...styles.memberAvatar,
                  ...(isMe ? styles.memberMe : {}),
                }}
              >
                <AvatarPreview config={m.avatar_config} size={36} />
              </div>
              <div style={{ ...styles.memberId, ...(isMe ? styles.memberIdMe : {}) }}>
                {m.user_id}
              </div>
            </div>
          );
        })}
        {overflow > 0 && (
          <div style={styles.memberColumn}>
            <div style={styles.memberStatus}>{'\u00A0'}</div>
            <div style={styles.overflowBadge}>+{overflow}</div>
            <div style={styles.memberId}>{'\u00A0'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },
  // Tooltip for single bubble (left side)
  tooltip: {
    position: 'absolute',
    right: 104,
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#333',
    color: '#fff',
    padding: '8px 14px',
    borderRadius: 10,
    fontSize: 12,
    whiteSpace: 'nowrap',
    maxWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    pointerEvents: 'none',
    zIndex: 10,
  },
  tooltipArrow: {
    position: 'absolute',
    right: -6,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 0,
    height: 0,
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    borderLeft: '6px solid #333',
  },
  // Single bubble (1.5x scale)
  bubble: {
    width: 96,
    height: 96,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    userSelect: 'none',
    flexShrink: 0,
    border: '3px solid #e67e22',
  },
  placeholder: {
    fontSize: 32,
    fontWeight: 700,
    color: '#e67e22',
  },
  // Cluster pill
  cluster: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 4,
    background: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    padding: '6px 10px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    userSelect: 'none',
    border: '2px solid rgba(230,126,34,0.25)',
  },
  memberColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 50,
    flexShrink: 0,
  },
  memberStatus: {
    fontSize: 9,
    color: '#e67e22',
    fontWeight: 600,
    width: 50,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginBottom: 2,
    minHeight: 13,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #eee',
    flexShrink: 0,
  },
  memberMe: {
    border: '3px solid #e67e22',
  },
  memberId: {
    fontSize: 9,
    color: '#666',
    width: 50,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginTop: 2,
  },
  memberIdMe: {
    color: '#e67e22',
    fontWeight: 600,
  },
  overflowBadge: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#ecf0f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: '#666',
    border: '2px solid #fff',
    flexShrink: 0,
  },
};
