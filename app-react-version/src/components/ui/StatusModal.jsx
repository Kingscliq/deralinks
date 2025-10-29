import React from 'react';

const PALETTES = {
  success: {
    icon: '✅',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    accent: '#1f5133',
  },
  error: {
    icon: '⚠️',
    gradient: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
    accent: '#641624',
  },
  info: {
    icon: 'ℹ️',
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    accent: '#15345a',
  },
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.55)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 9999,
};

const modalStyle = {
  width: 'min(420px, 100%)',
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: '0 24px 48px rgba(15, 23, 42, 0.32)',
  background: '#0f172a',
  color: '#f8fafc',
  display: 'flex',
  flexDirection: 'column',
};

const StatusModal = ({ open, type = 'info', title, message, onClose }) => {
  if (!open) return null;

  const palette = PALETTES[type] || PALETTES.info;
  const resolvedTitle =
    title ||
    (type === 'success'
      ? 'Success'
      : type === 'error'
      ? 'Something went wrong'
      : 'Notice');

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div
          style={{
            background: palette.gradient,
            color: palette.accent,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          <span style={{ fontSize: 26 }}>{palette.icon}</span>
          <span>{resolvedTitle}</span>
        </div>
        <div style={{ padding: '22px 24px', fontSize: 16, lineHeight: 1.6 }}>
          {typeof message === 'string' ? (
            <p style={{ margin: 0 }}>{message}</p>
          ) : (
            message
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            padding: '0 24px 24px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
              color: '#0f172a',
              border: 'none',
              borderRadius: 999,
              padding: '10px 20px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 10px 22px rgba(15, 23, 42, 0.15)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
