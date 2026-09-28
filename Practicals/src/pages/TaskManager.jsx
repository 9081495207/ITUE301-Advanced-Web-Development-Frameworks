import React, { useState, useEffect, useMemo } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getActiveBaseUrl,
  getAuthToken,
  loginUser,
  registerUser,
  getMe,
  logoutUser
} from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

/**
 * Modern TaskManager Component with JWT Authentication & Middleware Pipeline
 * Practical 7 Features:
 * - JWT Token-Based Authentication & Authorization Header (`Bearer <token>`)
 * - Login & Registration Modals/Tabs with bcrypt password verification
 * - Protected Task CRUD Operations scoped to authenticated user
 * - Supplementary #1: `/auth/me` user profile card
 * - Supplementary #2: 401 Unauthorized session expiry handling
 * - Supplementary #3: Client-side Token Logout mechanism
 */
function TaskManager() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(null);

  // Task State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Task Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [completed, setCompleted] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal State for Delete Confirmation
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: ''
  });

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Check existing token on component mount
  const checkAuthStatus = async () => {
    setAuthLoading(true);
    setAuthError(null);

    const token = getAuthToken();
    if (!token) {
      setCurrentUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      const response = await getMe();
      setCurrentUser(response.user);
      fetchTasksData();
    } catch (err) {
      setCurrentUser(null);
      logoutUser();
      showToast('Session expired. Please log in to continue.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch tasks for authenticated user
  const fetchTasksData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('token') || err.message.includes('Unauthorized') || err.message.includes('verification failed')) {
        setCurrentUser(null);
        logoutUser();
        showToast('Unauthorized (401). Invalid JWT Token. Redirected to Login.', 'error');
      } else {
        setError(`Failed to fetch tasks from MongoDB server (${getActiveBaseUrl()}/tasks): ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Login & Register submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    try {
      if (authMode === 'register') {
        const response = await registerUser({
          name: authName,
          email: authEmail,
          password: authPassword
        });
        setCurrentUser(response.user);
        showToast(`Registration successful! Welcome ${response.user.name}.`, 'success');
      } else {
        const response = await loginUser({
          email: authEmail,
          password: authPassword
        });
        setCurrentUser(response.user);
        showToast(`Login successful! Welcome back ${response.user.name}.`, 'success');
      }
      setAuthPassword('');
      fetchTasksData();
    } catch (err) {
      setAuthError(err.message);
      showToast(`Auth Failed: ${err.message}`, 'error');
    }
  };

  // Handle Quick Demo User Login
  const handleQuickDemoLogin = async () => {
    setAuthError(null);
    try {
      // Try registering demo user first if doesn't exist
      try {
        await registerUser({
          name: 'Jainam (Demo User)',
          email: 'jainam.demo@example.com',
          password: 'Password123!'
        });
      } catch {
        // If user exists, proceed to login
      }

      const response = await loginUser({
        email: 'jainam.demo@example.com',
        password: 'Password123!'
      });

      setCurrentUser(response.user);
      showToast('Logged in as Demo User with JWT Token!', 'success');
      fetchTasksData();
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setTasks([]);
    showToast('Logged out successfully. JWT token cleared.', 'success');
  };

  // Task Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      try {
        const response = await updateTask(editingId, { title, description, priority, completed });
        setTasks((prev) => prev.map((t) => (t._id === editingId ? response.data : t)));
        showToast('Task updated successfully in MongoDB!', 'success');
        resetForm();
      } catch (err) {
        showToast(`Update Failed: ${err.message}`, 'error');
      }
    } else {
      // Optimistic UI Update
      const tempId = `temp_${Date.now()}`;
      const optimisticTask = {
        _id: tempId,
        title: title.trim(),
        description: description.trim(),
        priority,
        completed,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      setTasks((prev) => [optimisticTask, ...prev]);
      const submittedTitle = title;
      const submittedDesc = description;
      const submittedPriority = priority;
      const submittedCompleted = completed;
      resetForm();
      showToast('Creating task (Optimistic Update)...', 'success');

      try {
        const response = await createTask({
          title: submittedTitle,
          description: submittedDesc,
          priority: submittedPriority,
          completed: submittedCompleted
        });
        setTasks((prev) => prev.map((t) => (t._id === tempId ? response.data : t)));
        showToast('Task persisted in MongoDB successfully!', 'success');
      } catch (err) {
        setTasks((prev) => prev.filter((t) => t._id !== tempId));
        showToast(`Creation Failed: ${err.message}. (Rolled back UI)`, 'error');
      }
    }
  };

  // Toggle Completion Status
  const handleToggle = async (task) => {
    try {
      const response = await updateTask(task._id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? response.data : t)));
      showToast(`Task marked as ${!task.completed ? 'Completed' : 'Pending'}.`, 'success');
    } catch (err) {
      showToast(`Toggle failed: ${err.message}`, 'error');
    }
  };

  // Open Delete Confirmation Modal
  const promptDelete = (task) => {
    setDeleteModalState({
      isOpen: true,
      taskId: task._id,
      taskTitle: task.title
    });
  };

  // Execute Confirmed Delete
  const confirmDeleteTask = async () => {
    const { taskId } = deleteModalState;
    setDeleteModalState({ isOpen: false, taskId: null, taskTitle: '' });

    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      showToast('Task deleted from MongoDB successfully.', 'success');
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Start Editing Task
  const handleEdit = (task) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority || 'medium');
    setCompleted(task.completed);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset Form State
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCompleted(false);
  };

  // Computed Task Analytics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completedCount = tasks.filter((t) => t.completed).length;
    const pendingCount = total - completedCount;
    const highPriorityCount = tasks.filter((t) => t.priority === 'high').length;
    return { total, completed: completedCount, pending: pendingCount, highPriority: highPriorityCount };
  }, [tasks]);

  // Filtered Tasks Computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'completed'
          ? t.completed
          : !t.completed;

      const matchesPriority =
        priorityFilter === 'all' ? true : t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <section className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="section-title">
              <span className="title-icon">🔐</span> Task Manager (JWT Auth & Middleware Pipeline)
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
              Practical 7: bcrypt password hashing, JWT authorization header (`Bearer &lt;token&gt;`), protected Express routes, and input validation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              API: {getActiveBaseUrl()}
            </div>

            {currentUser && (
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                🚪 Logout (@{currentUser.email.split('@')[0]})
              </button>
            )}
          </div>
        </div>

        {/* User Auth Banner or Login Box */}
        {authLoading ? (
          <Spinner message="Verifying JWT authentication token..." />
        ) : currentUser ? (
          /* Logged In User Profile Bar (Supplementary Problem #1: /auth/me) */
          <div
            className="form-container"
            style={{
              marginTop: '20px',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '18px', fontWeight: 700 }}>
                  👤
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
                    Authenticated as <strong>{currentUser.name}</strong>
                  </h4>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Email: {currentUser.email} | User ID: <code style={{ fontSize: '12px' }}>{currentUser._id}</code>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-completed">
                  🔑 JWT Token Active (Expires in 1h)
                </span>
                <button onClick={handleLogout} className="retry-btn" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Authentication Form Card (Login / Register Tabs) */
          <div className="form-container" style={{ marginTop: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div className="filter-bar">
                <button
                  className={`filter-btn ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  style={{ fontSize: '14px', padding: '6px 16px' }}
                >
                  🔑 User Login
                </button>
                <button
                  className={`filter-btn ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  style={{ fontSize: '14px', padding: '6px 16px' }}
                >
                  ✨ Register Account
                </button>
              </div>

              <button onClick={handleQuickDemoLogin} className="fetch-btn" style={{ fontSize: '13px', padding: '6px 14px' }}>
                ⚡ 1-Click Quick Demo Login
              </button>
            </div>

            {authError && (
              <div className="error-card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
                <div style={{ color: '#f43f5e', fontSize: '13px', fontWeight: 600 }}>⚠️ {authError}</div>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'end' }}>
              {authMode === 'register' && (
                <div className="form-group">
                  <label htmlFor="authName">Full Name *</label>
                  <input
                    type="text"
                    id="authName"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Jainam Kamani"
                    className="username-input"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="authEmail">Email Address *</label>
                <input
                  type="email"
                  id="authEmail"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="e.g. jainam@example.com"
                  className="username-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="authPassword">Password * (bcrypt hash)</label>
                <input
                  type="password"
                  id="authPassword"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="At least 6 characters..."
                  className="username-input"
                  required
                />
              </div>

              <button type="submit" className="fetch-btn" style={{ height: '42px' }}>
                {authMode === 'register' ? '✨ Create Account' : '🔓 Sign In with JWT'}
              </button>
            </form>
          </div>
        )}

        {/* Stats Summary Cards Bar */}
        <div className="stats-grid" style={{ marginTop: '24px' }}>
          <div className="stat-card">
            <div className="stat-icon total">📋</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">✅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon high">🔥</div>
            <div className="stat-info">
              <div className="stat-value">{stats.highPriority}</div>
              <div className="stat-label">High Priority</div>
            </div>
          </div>
        </div>

        {/* Form and List Layout */}
        <div className="contact-grid">
          {/* Form Side */}
          <div className="form-container">
            <h3>
              <span>{editingId ? '✏️' : '➕'}</span>
              {editingId ? 'Edit Task Document' : 'Create New Task'}
            </h3>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="title">Task Title *</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design API endpoints"
                  className="username-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Priority Level</label>
                <div className="priority-selector">
                  <button
                    type="button"
                    className={`priority-pill-btn ${priority === 'low' ? 'active low' : ''}`}
                    onClick={() => setPriority('low')}
                  >
                    🟢 Low
                  </button>
                  <button
                    type="button"
                    className={`priority-pill-btn ${priority === 'medium' ? 'active medium' : ''}`}
                    onClick={() => setPriority('medium')}
                  >
                    🟡 Medium
                  </button>
                  <button
                    type="button"
                    className={`priority-pill-btn ${priority === 'high' ? 'active high' : ''}`}
                    onClick={() => setPriority('high')}
                  >
                    🔴 High
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add optional notes, specifications, or details..."
                  className="username-input"
                ></textarea>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  id="completed"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-accent)' }}
                />
                <label htmlFor="completed" style={{ margin: 0, cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                  Mark initial status as Completed
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="fetch-btn" style={{ flex: 1 }}>
                  {editingId ? '💾 Save Changes' : '✨ Add Task'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Task List Side */}
          <div className="live-preview-container">
            {/* Filter & Search Header */}
            <div className="live-preview-header">
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🗄️</span> MongoDB Tasks ({filteredTasks.length})
              </h3>

              <div className="filter-bar">
                <button
                  className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All ({tasks.length})
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed ({stats.completed})
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="repo-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                  ✕
                </button>
              )}
            </div>

            {/* Render Tasks List */}
            {loading ? (
              <Spinner message="Connecting to MongoDB server and fetching protected tasks..." />
            ) : error ? (
              <ErrorMessage message={error} onRetry={fetchTasksData} />
            ) : filteredTasks.length === 0 ? (
              <div className="preview-card" style={{ padding: '36px', textAlign: 'center', borderRadius: '12px' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
                  {searchQuery || statusFilter !== 'all' ? 'No matching tasks found' : 'No tasks stored in MongoDB'}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try clearing your search query or changing filter settings.'
                    : 'Use the task creation form on the left to add your first item.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`task-card priority-${task.priority || 'medium'} ${task.completed ? 'completed-card' : ''}`}
                    style={{
                      opacity: task.isOptimistic ? 0.75 : 1,
                      borderStyle: task.isOptimistic ? 'dashed' : 'solid'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: '16px',
                              fontWeight: 700,
                              textDecoration: task.completed ? 'line-through' : 'none',
                              color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                            }}
                          >
                            {task.title}
                          </h4>
                          {task.isOptimistic && (
                            <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>⚡ Syncing...</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <span className={`badge ${task.completed ? 'badge-completed' : 'badge-pending'}`}>
                            {task.completed ? '✓ Completed' : '⏳ Pending'}
                          </span>
                          <span className={`badge badge-priority-${task.priority || 'medium'}`} style={{ textTransform: 'capitalize' }}>
                            Priority: {task.priority || 'medium'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleToggle(task)}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          disabled={task.isOptimistic}
                          title={task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                        >
                          {task.completed ? '🔄 Reopen' : '✓ Done'}
                        </button>

                        <button
                          onClick={() => handleEdit(task)}
                          className="fetch-btn"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          disabled={task.isOptimistic}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => promptDelete(task)}
                          className="retry-btn"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          disabled={task.isOptimistic}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p style={{ margin: '8px 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {task.description}
                      </p>
                    )}

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <span>🆔 {task._id}</span>
                      <span>📅 {new Date(task.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Toast Notification Component */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal Dialog */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Task Document"
        message={`Are you sure you want to delete '${deleteModalState.taskTitle}' from MongoDB? This action cannot be undone.`}
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteModalState({ isOpen: false, taskId: null, taskTitle: '' })}
      />
    </div>
  );
}

export default TaskManager;
