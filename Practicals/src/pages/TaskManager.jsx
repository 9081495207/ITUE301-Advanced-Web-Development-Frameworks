import React, { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const API_BASE = 'http://localhost:5000/tasks';

/**
 * TaskManager Page Component
 * Connects React frontend directly to Practical 5 Express + MongoDB / Mongoose REST API.
 * Styled cleanly to match repository's standard design system and layout.
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
      setError(`Cannot connect to Practical 5 MongoDB Server (${API_BASE}). Ensure 'npm start' is running in Practical5 directory.`);
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
        <h2 className="section-title">
          <span className="title-icon">🍃</span> Task Manager (MongoDB & Mongoose)
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Database Status:{' '}
          {dbConnected ? (
            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Connected to MongoDB (Port 5000)</span>
          ) : (
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Backend Offline</span>
          )}
        </p>

        <div className="contact-grid">
          {/* Form Container */}
          <div className="form-container">
            <h3>{editingId ? 'Edit Task' : 'Add New Task'}</h3>

            {formError && (
              <div className="error-card" style={{ margin: '10px 0', padding: '10px' }}>
                <strong style={{ color: '#ef4444' }}>Mongoose Validation Error:</strong> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="username-input"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="username-input"
                  style={{ width: '100%' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description (optional)..."
                  className="username-input"
                  style={{ width: '100%' }}
                ></textarea>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="completed"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="completed" style={{ margin: 0, cursor: 'pointer' }}>
                  Completed
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="fetch-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Task' : 'Add Task'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="retry-btn">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Live Preview / Tasks List */}
          <div className="live-preview-container">
            <h3>Tasks Collection ({tasks.length})</h3>

            {loading ? (
              <Spinner message="Fetching tasks from MongoDB..." />
            ) : error ? (
              <ErrorMessage message={error} onRetry={fetchTasks} />
            ) : tasks.length === 0 ? (
              <div className="preview-card" style={{ padding: '20px', textAlign: 'center' }}>
                <p>No tasks stored in MongoDB database.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map((task) => (
                  <div key={task._id} className="preview-card" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', textDecoration: task.completed ? 'line-through' : 'none' }}>
                          {task.title}
                        </h4>
                        <span className={`repo-badge ${task.completed ? 'public' : ''}`} style={{ marginRight: '6px' }}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                        <span className="repo-badge" style={{ textTransform: 'capitalize' }}>
                          Priority: {task.priority || 'medium'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => handleToggleCompleted(task)}
                          className="fetch-btn"
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                        >
                          {task.completed ? 'Pending' : 'Complete'}
                        </button>
                        <button
                          onClick={() => handleEdit(task)}
                          className="fetch-btn"
                          style={{ padding: '2px 8px', fontSize: '12px', backgroundColor: '#6366f1' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="retry-btn"
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p style={{ margin: '8px 0 4px 0', fontSize: '13px' }}>
                      {task.description || <em>No description provided</em>}
                    </p>

                    <div style={{ fontSize: '11px', opacity: 0.7 }}>
                      ID: {task._id} | {new Date(task.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default TaskManager;
