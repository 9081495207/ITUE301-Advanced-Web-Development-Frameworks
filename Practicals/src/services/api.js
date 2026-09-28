/**
 * Central API Service Module with JWT Authentication & Dynamic Port Failover
 * Supports automatic fallback across ports 5001 and 5000
 */
const DEFAULT_PORTS = [5002, 5001, 5000];
let activeBaseUrl = `http://localhost:${DEFAULT_PORTS[0]}`;
const TOKEN_KEY = 'practical7_jwt_token';

/**
 * Token Storage Helpers
 */
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeAuthToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Helper to execute fetch with port failover & JWT authorization headers
 */
async function fetchApi(endpoint, options = {}) {
  let lastError = null;

  // Clone headers & attach JWT token if available
  const headers = { ...options.headers };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const requestOptions = { ...options, headers };

  // Try active base URL first
  try {
    const res = await fetch(`${activeBaseUrl}${endpoint}`, requestOptions);

    // Supplementary Problem #2: Handle 401 Unauthorized token expiry
    if (res.status === 401) {
      removeAuthToken();
    }

    return res;
  } catch (err) {
    lastError = err;
  }

  // Try fallback ports if activeBaseUrl failed with network error
  for (const port of DEFAULT_PORTS) {
    const candidateUrl = `http://localhost:${port}`;
    if (candidateUrl === activeBaseUrl) continue;
    try {
      const res = await fetch(`${candidateUrl}${endpoint}`, requestOptions);
      activeBaseUrl = candidateUrl;

      if (res.status === 401) {
        removeAuthToken();
      }

      return res;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Backend server is offline or unreachable.');
}

/**
 * Fetch active base URL
 */
export const getActiveBaseUrl = () => activeBaseUrl;

/**
 * Authentication Endpoints (Practical 7)
 */
export const registerUser = async (userData) => {
  const res = await fetchApi('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
};

export const loginUser = async (credentials) => {
  const res = await fetchApi('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
};

// Supplementary Problem #1: /auth/me endpoint
export const getMe = async () => {
  const res = await fetchApi('/auth/me');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }
  return res.json();
};

export const logoutUser = () => {
  removeAuthToken();
};

/**
 * Task Endpoints (Protected by JWT)
 */
export const getTasks = async () => {
  const res = await fetchApi('/tasks');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const getTaskById = async (id) => {
  const res = await fetchApi(`/tasks/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const createTask = async (taskData) => {
  const res = await fetchApi('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create task');
  }
  return data;
};

export const updateTask = async (id, taskData) => {
  const res = await fetchApi(`/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update task');
  }
  return data;
};

export const deleteTask = async (id) => {
  const res = await fetchApi(`/tasks/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete task');
  }
  return data;
};
