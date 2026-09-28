import React from 'react';

/**
 * Modern Confirmation Modal Dialog Component
 * Prompts user for confirmation before performing destructive tasks like deleting.
 */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'slideIn 0.2s ease'
      }}
    >
      <div
        className="form-container"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)'
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>

        <h3 style={{ margin: '0 0 10px 0', border: 'none', padding: 0, fontSize: '20px' }}>
          {title || 'Confirm Action'}
        </h3>

        <p style={{ fontSize: '14px', marginBottom: '24px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {message || 'Are you sure you want to proceed with this operation?'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onCancel}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="retry-btn"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            🗑️ Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
