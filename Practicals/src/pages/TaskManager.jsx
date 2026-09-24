import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

/**
 * TaskManager Component for Practical 6 Full-Stack Integration
 * Features:
 * - Central API consumption via src/services/api.js
 * - Optimistic UI Updates on Task Creation
 * - Reusable Toast Notifications for API results
 * - Confirmation Modal before Deleting Tasks
 * - Loading & Error state handling
 */
function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [completed, setCompleted] = useState(false);

  // Modal State for Delete Confirmation
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: ''
  });

  // Fetch tasks on component mount
  const fetchTasksData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (err) {
      setError(`Failed to fetch tasks from MongoDB server (http://localhost:5000/tasks): ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Submit Handler (Create Task with Optimistic UI Update OR Update Task)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      // Standard Update Flow
      try {
        const response = await updateTask(editingId, { title, description, priority, completed });
        setTasks((prev) => prev.map((t) => (t._id === editingId ? response.data : t)));
        showToast('Task updated successfully in MongoDB!', 'success');
        resetForm();
      } catch (err) {
        showToast(`Update Failed: ${err.message}`, 'error');
      }
    } else {
      // Supplementary Problem #1: Optimistic UI Update for Task Creation
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

      // 1. Immediately show the new task in the list before server confirms
      setTasks((prev) => [optimisticTask, ...prev]);
      const submittedTitle = title;
      resetForm();
      showToast('Creating task (Optimistic Update)...', 'success');

      try {
        // 2. Perform backend API call
        const response = await createTask({
          title: submittedTitle,
          description,
          priority,
          completed
        });

        // 3. Replace temp optimistic item with real persisted MongoDB document
        setTasks((prev) => prev.map((t) => (t._id === tempId ? response.data : t)));
        showToast('Task persisted in MongoDB successfully!', 'success');
      } catch (err) {
        // 4. Rollback optimistic task on server failure
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
      showToast(`Toggle status failed: ${err.message}`, 'error');
    }
  };

  // Open Delete Confirmation Modal (Supplementary Problem #2)
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
  };

  // Reset Form State
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCompleted(false);
  };

  return (
    <div className="page-wrapper">
      <section className="section-card">
        <h2 className="section-title">
          <span className="title-icon">🍃</span> Full-Stack Task Manager (Practical 6)
        </h2>

        <p style={{ marginBottom: '15px' }}>
          Connects React frontend (`http://localhost:5173`) to Node/Express/MongoDB backend (`http://localhost:5000/tasks`) via central API service module.
        </p>

        <div className="contact-grid">
          {/* Task Creation & Edit Form */}
          <div className="form-container">
            <h3>{editingId ? 'Edit Task' : 'Add New Task'}</h3>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="title">Task Title *</label>
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
                  placeholder="Enter optional task details..."
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
                <button type="submit" className="fetch-btn">
                  {editingId ? 'Update Task' : 'Add Task'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="retry-btn">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Task Collection List */}
          <div className="live-preview-container">
            <h3>MongoDB Tasks Collection ({tasks.length})</h3>

            {loading ? (
              <Spinner message="Fetching tasks from MongoDB server..." />
            ) : error ? (
              <ErrorMessage message={error} onRetry={fetchTasksData} />
            ) : tasks.length === 0 ? (
              <div className="preview-card" style={{ padding: '20px', textAlign: 'center' }}>
                <p>No tasks stored in MongoDB database.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="preview-card"
                    style={{
                      margin: 0,
                      opacity: task.isOptimistic ? 0.75 : 1,
                      borderStyle: task.isOptimistic ? 'dashed' : 'solid'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', textDecoration: task.completed ? 'line-through' : 'none' }}>
                          {task.title}
                          {task.isOptimistic && <small style={{ color: '#eab308', marginLeft: '6px' }}>(Syncing...)</small>}
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
                          onClick={() => handleToggle(task)}
                          className="fetch-btn"
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                          disabled={task.isOptimistic}
                        >
                          {task.completed ? 'Pending' : 'Complete'}
                        </button>
                        <button
                          onClick={() => handleEdit(task)}
                          className="fetch-btn"
                          style={{ padding: '2px 8px', fontSize: '12px', backgroundColor: '#6366f1' }}
                          disabled={task.isOptimistic}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => promptDelete(task)}
                          className="retry-btn"
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                          disabled={task.isOptimistic}
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

      {/* Toast Notification Component */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal Dialog */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Confirm Delete Task"
        message={`Are you sure you want to delete '${deleteModalState.taskTitle}' from MongoDB? This action cannot be undone.`}
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteModalState({ isOpen: false, taskId: null, taskTitle: '' })}
      />
    </div>
  );
}

export default TaskManager;
