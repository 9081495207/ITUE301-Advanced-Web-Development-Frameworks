const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const tasksStore = require('../src/data/tasksStore');

let server;
let baseUrl;

before(() => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(() => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

beforeEach(() => {
  tasksStore.reset();
});

// Helper HTTP request function
function makeRequest(path, method = 'GET', data = null, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { ...customHeaders };

    let payload = null;
    if (data !== null) {
      payload = typeof data === 'string' ? data : JSON.stringify(data);
      if (!headers['content-type'] && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(url, { method, headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

test('GET /tasks - returns 200 OK and all initial tasks', async () => {
  const res = await makeRequest('/tasks');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 200);
  assert.equal(Array.isArray(res.body.data), true);
  assert.equal(res.body.data.length, 3);
});

test('GET /tasks/:id - returns 200 OK for valid existing task', async () => {
  const res = await makeRequest('/tasks/1');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.id, 1);
  assert.equal(res.body.data.title, 'Setup Node & Express Server');
});

test('GET /tasks/:id - returns 404 Not Found for non-existent task', async () => {
  const res = await makeRequest('/tasks/999');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Not Found');
});

test('GET /tasks/:id - returns 400 Bad Request via validateTaskId for non-numeric ID', async () => {
  const res = await makeRequest('/tasks/abc');
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Bad Request');
  assert.match(res.body.message, /Invalid Task ID/);
});

test('POST /tasks - creates a new task and returns 201 Created', async () => {
  const newTaskData = {
    title: 'Write automated unit tests',
    description: 'Use Node native test runner',
    completed: false
  };

  const res = await makeRequest('/tasks', 'POST', newTaskData);
  assert.equal(res.status, 201);
  assert.equal(res.body.data.title, newTaskData.title);
  assert.equal(res.body.data.id, 4);

  // Verify fetch all reflects updated task list
  const listRes = await makeRequest('/tasks');
  assert.equal(listRes.body.data.length, 4);
});

test('POST /tasks - returns 400 Bad Request if title is missing', async () => {
  const res = await makeRequest('/tasks', 'POST', { description: 'Missing title' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Bad Request');
});

test('POST /tasks - returns 415 Unsupported Media Type if Content-Type is not application/json', async () => {
  const res = await makeRequest('/tasks', 'POST', 'title=Test', { 'Content-Type': 'text/plain' });
  assert.equal(res.status, 415);
  assert.equal(res.body.error, 'Unsupported Media Type');
});

test('PUT /tasks/:id - updates an existing task and returns 200 OK', async () => {
  const updateData = {
    title: 'Updated Express Server Title',
    completed: true
  };

  const res = await makeRequest('/tasks/1', 'PUT', updateData);
  assert.equal(res.status, 200);
  assert.equal(res.body.data.title, 'Updated Express Server Title');
  assert.equal(res.body.data.completed, true);
});

test('PUT /tasks/:id - returns 404 Not Found if task does not exist', async () => {
  const res = await makeRequest('/tasks/999', 'PUT', { title: 'Non-existent task' });
  assert.equal(res.status, 404);
});

test('DELETE /tasks/:id - deletes task and returns 200 OK', async () => {
  const res = await makeRequest('/tasks/1', 'DELETE');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.id, 1);

  // Verify task no longer exists
  const getRes = await makeRequest('/tasks/1');
  assert.equal(getRes.status, 404);
});

test('GET /undefined-route - returns 404 Not Found via notFoundHandler', async () => {
  const res = await makeRequest('/some-random-route');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Not Found');
  assert.match(res.body.message, /Route does not exist/);
});

test('GET /tasks/trigger-error - returns 500 Internal Server Error via globalErrorHandler', async () => {
  const res = await makeRequest('/tasks/trigger-error');
  assert.equal(res.status, 500);
  assert.equal(res.body.error, 'Internal Server Error');
  assert.match(res.body.message, /Simulated unhandled internal server error/);
});
