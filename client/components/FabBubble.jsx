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
            <AvatarPreview config={user.avatar_config} size={44} />
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
            <AvatarPreview config={user.avatar_config} size={44} />
          ) : (
            <div style={styles.placeholder}>?</div>
          )}
        </div>
      </div>
    );
  }

  // Cluster mode: all team members in a pill
  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - MAX_VISIBLE;

  return (
    <div
      style={styles.container}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && statusText && (
        <div style={styles.clusterTooltip}>
          {statusText}
          <div style={styles.clusterTooltipArrow} />
        </div>
      )}
      <div
        style={{
          ...styles.cluster,
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
          boxShadow: hovered
            ? '0 6px 20px rgba(230,126,34,0.3)'
            : '0 3px 12px rgba(0,0,0,0.12)',
        }}
        onMouseDown={handleMouseDown}
      >
        {visible.map((m, i) => {
          const isMe = m.user_id === user?.id;
          return (
            <div
              key={m.user_id}
              style={{
                ...styles.memberAvatar,
                ...(isMe ? styles.memberMe : {}),
                marginLeft: i === 0 ? 0 : -8,
                zIndex: visible.length - i,
              }}
              title={m.user_id + ': ' + (m.statusText || '(no status)')}
            >
              <AvatarPreview config={m.avatar_config} size={26} />
            </div>
          );
        })}
        {overflow > 0 && (
          <div style={{ ...styles.overflowBadge, marginLeft: -8, zIndex: 0 }}>
            +{overflow}
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
    right: 72,
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
  // Tooltip for cluster (above)
  clusterTooltip: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: 8,
    background: '#333',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 12,
    whiteSpace: 'nowrap',
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    pointerEvents: 'none',
    zIndex: 10,
  },
  clusterTooltipArrow: {
    position: 'absolute',
    bottom: -6,
    right: 16,
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #333',
  },
  // Single bubble
  bubble: {
    width: 64,
    height: 64,
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
    fontSize: 24,
    fontWeight: 700,
    color: '#e67e22',
  },
  // Cluster pill
  cluster: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    padding: '6px 14px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    userSelect: 'none',
    border: '2px solid rgba(230,126,34,0.25)',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff',
    position: 'relative',
    flexShrink: 0,
  },
  memberMe: {
    border: '2px solid #e67e22',
  },
  overflowBadge: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#ecf0f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: '#666',
    border: '2px solid #fff',
    position: 'relative',
    flexShrink: 0,
  },
};
