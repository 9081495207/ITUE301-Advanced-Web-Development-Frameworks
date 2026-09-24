import React from 'react';

/**
 * Confirmation Modal Dialog Component
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
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="preview-card"
        style={{
          maxWidth: '450px',
          width: '100%',
          padding: '24px',
          margin: 0,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
          borderRadius: '12px'
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', color: 'var(--text)' }}>
          {title || 'Confirm Action'}
        </h3>

        <p style={{ fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
          {message || 'Are you sure you want to proceed with this operation?'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onCancel}
            className="not-found-btn secondary"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="retry-btn"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
