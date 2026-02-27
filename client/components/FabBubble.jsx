import React, { useState, useRef, useCallback } from 'react';
import { AvatarPreview } from './AvatarEditor.jsx';

export default function FabBubble({ user, statusText, onToggle, expanded }) {
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

  return (
    <div
      style={styles.container}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Speech bubble tooltip */}
      {hovered && statusText && !expanded && (
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
        onMouseDown={expanded ? undefined : handleMouseDown}
        onClick={expanded ? handleClick : undefined}
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

const styles = {
  container: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },
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
};
