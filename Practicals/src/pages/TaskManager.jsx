import React, { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const API_BASE = 'http://localhost:5000/tasks';

/**
 * TaskManager Page Component
 * Connects React frontend directly to Practical 5 Express + MongoDB / Mongoose REST API.
 * Features:
 * - Live task listing from MongoDB
 * - Create new Task with Mongoose schema validation
 * - Update existing Task & toggle completed status
 * - Delete Task by MongoDB ObjectId
 * - Real-time connection status indicator & structured error messages
 */
function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [completed, setCompleted] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch tasks from MongoDB backend
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setTasks(data.data || []);
      setDbConnected(true);
    } catch (err) {
      setError(`Cannot connect to Practical 5 MongoDB Server (${API_BASE}). Ensure 'npm start' is running in Practical5 folder.`);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = { title, description, priority, completed };
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        // Display Mongoose structured validation error message
        throw new Error(data.message || 'Mongoose schema validation failed.');
      }

      resetForm();
      fetchTasks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Task Completion Toggle
  const handleToggleCompleted = async (task) => {
    try {
      const res = await fetch(`${API_BASE}/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to toggle completion status:', err);
    }
  };

  // Handle Delete Task
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task from MongoDB?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Delete request failed:', err);
    }
  };

  // Start Editing Task
  const handleEdit = (task) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority || 'medium');
    setCompleted(task.completed);
    setFormError(null);
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCompleted(false);
    setFormError(null);
  };

  return (
    <div className="page-wrapper">
      <section className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            <span className="title-icon">🍃</span> Task Manager (MongoDB & Mongoose)
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: dbConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${dbConnected ? '#10b981' : '#ef4444'}`, padding: '0.4rem 0.8rem', borderRadius: '9999px', fontSize: '0.85rem', color: dbConnected ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dbConnected ? '#10b981' : '#ef4444', boxShadow: `0 0 8px ${dbConnected ? '#10b981' : '#ef4444'}` }}></span>
            {dbConnected ? 'MongoDB Live (Port 5000)' : 'Backend Disconnected'}
          </div>
        </div>

        {/* Task Input Form */}
        <div style={{ background: 'var(--card-bg-subtle, rgba(30, 41, 59, 0.5))', backdropFilter: 'blur(12px)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {editingId ? '✏️ Edit Task (MongoDB)' : '➕ Create New Task (Schema Enforced)'}
            </h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: '0.375rem' }}>
                Cancel Edit
              </button>
            )}
          </div>

          {formError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <strong>⚠️ Mongoose Error:</strong> {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Top Row: Title (70%) + Priority Enum (30%) */}
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Practical 5 Submission..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="username-input"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Priority Enum</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="username-input"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.95rem', cursor: 'pointer' }}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority (Default)</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>
            </div>

            {/* Middle Row: Description (Full Width) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Description</label>
              <textarea
                placeholder="Add task description or optional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="username-input"
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {/* Bottom Row: Checkbox + Action Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: '#e2e8f0', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                />
                <span>Mark Task as Completed</span>
              </label>

              <button type="submit" disabled={submitting} className="fetch-btn" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
                {submitting ? 'Saving...' : editingId ? 'Update Task' : '🚀 Create Task'}
              </button>
            </div>
          </form>
        </div>

        {/* Task List Display */}
        {loading ? (
          <Spinner message="Connecting to MongoDB & Loading Tasks..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchTasks} />
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📭 No tasks found in MongoDB database.</p>
            <p style={{ fontSize: '0.9rem' }}>Use the form above to create your first task!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.map((task) => {
              const priorityColors = {
                high: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
                medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
                low: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' }
              };
              const pStyle = priorityColors[task.priority] || priorityColors.medium;

              return (
                <div
                  key={task._id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.85rem',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1.25rem',
                    flexWrap: 'wrap',
                    transition: 'border-color 0.2s, transform 0.15s'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1, color: '#f8fafc' }}>
                        {task.title}
                      </h4>
                      
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '0.375rem',
                          background: task.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: task.completed ? '#10b981' : '#f59e0b'
                        }}
                      >
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '0.375rem',
                          background: pStyle.bg,
                          color: pStyle.text,
                          border: `1px solid ${pStyle.border}`,
                          textTransform: 'uppercase'
                        }}
                      >
                        {task.priority || 'medium'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.4rem', lineHeight: '1.4' }}>
                      {task.description || <em>No description provided</em>}
                    </p>

                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(148, 163, 184, 0.6)' }}>
                      MongoDB ObjectId: {task._id} | Created: {new Date(task.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleToggleCompleted(task)}
                      className="fetch-btn"
                      style={{ background: task.completed ? '#475569' : '#10b981', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      {task.completed ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => handleEdit(task)}
                      className="fetch-btn"
                      style={{ background: '#6366f1', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="retry-btn"
                      style={{ background: '#ef4444', color: '#fff', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default TaskManager;
