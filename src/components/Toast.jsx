import React, { useEffect } from 'react';

const toastStyles = {
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '20px',
  zIndex: 9999,
  minWidth: '280px',
  maxWidth: '90%',
  borderRadius: '14px',
  boxShadow: '0 18px 50px rgba(0,0,0,0.14)',
  padding: '14px 18px',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
};

const typeColors = {
  success: 'rgba(56, 142, 60, 0.95)',
  error: 'rgba(211, 47, 47, 0.95)',
  warning: 'rgba(245, 124, 0, 0.95)',
};

const Toast = ({ type = 'success', message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div style={{ ...toastStyles, backgroundColor: typeColors[type] || typeColors.success }}>
      <div style={{ flex: 1, fontSize: '0.95rem' }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          border: 'none',
          background: 'transparent',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1.2rem',
          lineHeight: '1'
        }}
        aria-label="Dismiss toast"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
