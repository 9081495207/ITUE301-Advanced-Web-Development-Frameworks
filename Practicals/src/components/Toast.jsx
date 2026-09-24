import React, { useEffect } from 'react';

/**
 * Toast Notification Component
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
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        borderRadius: '8px',
        backgroundColor: isSuccess ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        fontSize: '14px',
        fontWeight: '600',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${isSuccess ? '#16a34a' : '#dc2626'}`,
        animation: 'slideIn 0.3s ease'
      }}
    >
      <span>{isSuccess ? '✓' : '⚠️'}</span>
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          marginLeft: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
