const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const { connectDB, disconnectDB } = require('../src/config/db');
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

test('Practical 6 API - Full Stack Integration Test Suite', async (t) => {
  let createdTaskId;

  await t.test('POST /tasks - Should create task with Mongoose schema & priority enum', async () => {
    const payload = {
      title: '  Practical 6 Full-Stack Task  ',
      description: 'Testing React + Node + MongoDB End to End Flow',
      priority: 'high'
    };

    const res = await httpRequest(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.status, 201);
    assert.equal(res.body.data.title, 'Practical 6 Full-Stack Task', 'Title should be trimmed by pre-save hook');
    assert.equal(res.body.data.priority, 'high');
    assert.equal(res.body.data.completed, false);
    assert.ok(res.body.data._id);

    createdTaskId = res.body.data._id;
  });

  await t.test('GET /tasks - Should retrieve all tasks for React frontend rendering', async () => {
    const res = await httpRequest(`${baseUrl}/tasks`, { method: 'GET' });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.count, 1);
  });

  await t.test('PUT /tasks/:id - Should update task state in MongoDB', async () => {
    const res = await httpRequest(`${baseUrl}/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, { completed: true, priority: 'medium' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.completed, true);
    assert.equal(res.body.data.priority, 'medium');
  });

  await t.test('DELETE /tasks/:id - Should remove task from MongoDB after confirmation', async () => {
    const res = await httpRequest(`${baseUrl}/tasks/${createdTaskId}`, { method: 'DELETE' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data._id, createdTaskId);

    const checkRes = await httpRequest(`${baseUrl}/tasks/${createdTaskId}`, { method: 'GET' });
    assert.equal(checkRes.status, 404);
  });
});
