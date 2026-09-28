import React, { useEffect } from 'react';

/**
 * Modern Toast Notification Component
 * Displays success or failure toast messages after each API action.
 * Features auto-dismiss after duration.
 */
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '12px',
        backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(244, 63, 94, 0.95)',
        color: '#ffffff',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
        fontSize: '14px',
        fontWeight: '600',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isSuccess ? '#10b981' : '#f43f5e'}`,
        animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <span style={{ fontSize: '18px' }}>{isSuccess ? '✓' : '⚠️'}</span>
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          marginLeft: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          opacity: 0.8
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
