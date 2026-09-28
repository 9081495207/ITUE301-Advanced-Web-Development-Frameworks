const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../models/User');
const Task = require('../models/Task');

let server;
let baseUrl;

function httpRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

test.before(async () => {
  await connectDB();
  await Task.deleteMany({});
  await User.deleteMany({});

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
});

test('Practical 7 - JWT Authentication & Middleware Test Suite', async (t) => {
  let authToken;
  let userId;
  let taskId;

  const testUser = {
    name: 'Jainam Auth Test',
    email: 'jainam.test@example.com',
    password: 'SecurePassword123!'
  };

  await t.test('POST /auth/register - Should register user & return JWT token', async () => {
    const res = await httpRequest(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, testUser);

    assert.equal(res.status, 201);
    assert.equal(res.body.status, 201);
    assert.ok(res.body.token, 'Should return signed JWT token');
    assert.equal(res.body.user.email, testUser.email);
    assert.equal(res.body.user.password, undefined, 'Password should NOT be returned in response');

    authToken = res.body.token;
    userId = res.body.user._id;
  });

  await t.test('POST /auth/login - Should authenticate user with valid credentials', async () => {
    const res = await httpRequest(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testUser.email,
      password: testUser.password
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token, 'Should return signed JWT token');
    assert.equal(res.body.user.name, testUser.name);
  });

  await t.test('POST /auth/login - Should reject invalid password', async () => {
    const res = await httpRequest(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testUser.email,
      password: 'WrongPassword'
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Invalid Credentials');
  });

  await t.test('GET /auth/me - Should return current user profile using decoded JWT (Supplementary #1)', async () => {
    const res = await httpRequest(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, testUser.email);
  });

  await t.test('GET /tasks - Should reject request without Bearer token (401 Unauthorized)', async () => {
    const res = await httpRequest(`${baseUrl}/tasks`, { method: 'GET' });

    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Unauthorized Access');
  });

  await t.test('POST /tasks - Should create task for authenticated user', async () => {
    const taskPayload = {
      title: 'Practical 7 Auth Task',
      description: 'Testing protected task creation with JWT',
      priority: 'high'
    };

    const res = await httpRequest(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, taskPayload);

    assert.equal(res.status, 201);
    assert.equal(res.body.data.title, 'Practical 7 Auth Task');
    assert.equal(res.body.data.user, userId);
    assert.equal(res.body.data.completed, false);

    taskId = res.body.data._id;
  });

  await t.test('GET /tasks - Should retrieve tasks scoped to authenticated user', async () => {
    const res = await httpRequest(`${baseUrl}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0]._id, taskId);
  });

  await t.test('PUT /tasks/:id - Should update protected task', async () => {
    const res = await httpRequest(`${baseUrl}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, { completed: true });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.completed, true);
  });

  await t.test('DELETE /tasks/:id - Should delete protected task', async () => {
    const res = await httpRequest(`${baseUrl}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.data._id, taskId);
  });
});
