const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const { connectDB, disconnectDB } = require('../src/config/db');
const Task = require('../models/Task');

let server;
let baseUrl;

// Helper function to send HTTP requests to test server
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
  // Clear any leftover test data
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

test('Practical 5 API - Mongoose & MongoDB Integration Test Suite', async (t) => {
  let createdTaskId;

  await t.test('POST /tasks - Should create a task with default completed=false and createdAt date', async () => {
    const payload = {
      title: 'Practical 5 Mongoose Task',
      description: 'Testing MongoDB integration with schema validation'
    };

    const res = await httpRequest(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.status, 201);
    assert.equal(res.body.message, 'Task created successfully.');
    assert.ok(res.body.data._id, 'Task should have Mongoose ObjectId');
    assert.equal(res.body.data.title, payload.title);
    assert.equal(res.body.data.description, payload.description);
    assert.equal(res.body.data.completed, false, 'Default completed state should be false');
    assert.ok(res.body.data.createdAt, 'Task should contain createdAt timestamp');

    createdTaskId = res.body.data._id;
  });

  await t.test('POST /tasks - Should fail with 400 Bad Request when title field is missing (Schema Validation)', async () => {
    const payload = {
      description: 'Missing required title field'
    };

    const res = await httpRequest(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, payload);

    assert.equal(res.status, 400);
    assert.equal(res.body.status, 400);
    assert.equal(res.body.error, 'Validation Error');
    assert.ok(res.body.message.includes('title'), 'Validation error message should specify title requirement');
    assert.ok(Array.isArray(res.body.details), 'Structured details array should be present');
  });

  await t.test('GET /tasks - Should retrieve all tasks from MongoDB collection', async () => {
    const res = await httpRequest(`${baseUrl}/tasks`, { method: 'GET' });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 200);
    assert.equal(typeof res.body.count, 'number');
    assert.ok(res.body.count >= 1);
    assert.ok(Array.isArray(res.body.data));
  });

  await t.test('GET /tasks/:id - Should retrieve a specific task by MongoDB ObjectId', async () => {
    const res = await httpRequest(`${baseUrl}/tasks/${createdTaskId}`, { method: 'GET' });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 200);
    assert.equal(res.body.data._id, createdTaskId);
    assert.equal(res.body.data.title, 'Practical 5 Mongoose Task');
  });

  await t.test('GET /tasks/:id - Should return 400 Bad Request for invalid ObjectId format (CastError / validateId)', async () => {
    const res = await httpRequest(`${baseUrl}/tasks/invalid-object-id-123`, { method: 'GET' });

    assert.equal(res.status, 400);
    assert.equal(res.body.status, 400);
    assert.equal(res.body.error, 'Invalid ID Format');
  });

  await t.test('POST /tasks - Pre-save hook should automatically trim whitespace from title', async () => {
    const payload = {
      title: '   Trimmed Title Test   ',
      description: 'Testing pre-save hook trimming',
      priority: 'high'
    };

    const res = await httpRequest(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.data.title, 'Trimmed Title Test', 'Title should be automatically trimmed by pre-save hook');
    assert.equal(res.body.data.priority, 'high', 'Priority should match enum value');
  });

  await t.test('POST /tasks - Should reject invalid priority value not in enum', async () => {
    const payload = {
      title: 'Invalid Priority Task',
      priority: 'super_urgent'
    };

    const res = await httpRequest(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, payload);

    assert.equal(res.status, 400);
    assert.equal(res.body.status, 400);
    assert.equal(res.body.error, 'Validation Error');
    assert.ok(res.body.message.includes('Priority'), 'Error message should indicate invalid priority enum');
  });

  await t.test('GET /tasks/:id - Should return a 404 JSON response if the ID does not exist', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011'; // Valid 24-hex string, but not in DB
    const res = await httpRequest(`${baseUrl}/tasks/${nonExistentId}`, { method: 'GET' });

    assert.equal(res.status, 404);
    assert.equal(res.body.status, 404);
    assert.equal(res.body.error, 'Not Found');
    assert.ok(res.body.message.includes(nonExistentId), '404 JSON response message should reference requested ID');
  });

  await t.test('PUT /tasks/:id - Should update an existing task in MongoDB', async () => {
    const updatePayload = {
      title: 'Updated Practical 5 Task Title',
      completed: true
    };

    const res = await httpRequest(`${baseUrl}/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, updatePayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 200);
    assert.equal(res.body.data.title, 'Updated Practical 5 Task Title');
    assert.equal(res.body.data.completed, true);
  });

  await t.test('DELETE /tasks/:id - Should delete a task from MongoDB', async () => {
    const res = await httpRequest(`${baseUrl}/tasks/${createdTaskId}`, { method: 'DELETE' });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 200);
    assert.equal(res.body.data._id, createdTaskId);

    // Verify task no longer exists
    const checkRes = await httpRequest(`${baseUrl}/tasks/${createdTaskId}`, { method: 'GET' });
    assert.equal(checkRes.status, 404);
  });
});
