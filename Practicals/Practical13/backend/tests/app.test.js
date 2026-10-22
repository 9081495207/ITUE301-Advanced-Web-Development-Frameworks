/**
 * Practical 13: AI API Integration
 * Test Suite for the Task Management API with AI Endpoint
 */

const request = require('supertest');
const { connectDB, disconnectDB } = require('../src/config/db');

let app;

// ─── Global Setup: connect to in-memory DB before all tests ──────────────────
beforeAll(async () => {
  // Explicitly connect before requiring the app so mongoose is ready
  await connectDB();
  // Now require the app (server.js guards the listen() behind require.main check)
  app = require('../server');
}, 30000);

// ─── Global Teardown: close DB connections after all tests ───────────────────
afterAll(async () => {
  await disconnectDB();
}, 15000);

// ─── Test Suite 1: Root / Health Endpoint ────────────────────────────────────
describe('GET / - Root Health Endpoint', () => {
  test('returns HTTP 200 and a JSON status object', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 200);
    expect(res.body).toHaveProperty('message');
  });
});

// ─── Test Suite 2: Task Endpoints (Auth-Protected) ───────────────────────────
describe('GET /tasks - Tasks Endpoint (unauthenticated)', () => {
  test('returns HTTP 401 when no auth token is provided', async () => {
    const res = await request(app).get('/tasks');
    // /tasks is protected — unauthenticated requests must be rejected
    expect(res.statusCode).toBe(401);
  });

  test('returns HTTP 404 for a non-existent route', async () => {
    const res = await request(app).get('/non-existent-route-xyz');
    expect(res.statusCode).toBe(404);
  });
});

// ─── Test Suite 3: Auth Endpoints ────────────────────────────────────────────
describe('POST /auth/register - User Registration', () => {
  test('registers a new user and returns HTTP 201', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'CI Test User',
        email: `ci_test_${Date.now()}@example.com`,
        password: 'TestPassword123!'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  test('returns HTTP 400 when email is missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Bad User', password: 'pass' });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /auth/login - User Login', () => {
  const credentials = {
    email: `ci_login_${Date.now()}@example.com`,
    password: 'LoginTest456!'
  };

  // Register user first so we can test login
  beforeAll(async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'Login Test User', ...credentials });
  });

  test('returns HTTP 200 and a JWT token on valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send(credentials);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('returns HTTP 401 on invalid password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: credentials.email, password: 'WrongPassword!' });
    expect(res.statusCode).toBe(401);
  });
});

// ─── Test Suite 4: Full Authenticated Task Workflow ──────────────────────────
describe('Authenticated Task CRUD', () => {
  let token;

  beforeAll(async () => {
    // Register + login to get a valid JWT for task tests
    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        name: 'Task CRUD User',
        email: `task_crud_${Date.now()}@example.com`,
        password: 'CrudTest789!'
      });
    token = registerRes.body.token;
  });

  test('GET /tasks returns HTTP 200 for an authenticated user', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('POST /tasks creates a task and returns HTTP 201', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'CI Pipeline Test Task',
        description: 'Created by Jest in GitHub Actions',
        completed: false,
        priority: 'high'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('title', 'CI Pipeline Test Task');
  });
});

// ─── Test Suite 5: AI Description Generation Endpoints ──────────────────────
describe('POST /api/ai/generate-description', () => {
  test('returns HTTP 400 when title is missing or empty', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Bad Request');
  });

  test('returns graceful fallback response when API key is missing or unconfigured', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Complete Web Project Report' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('description');
  });
});

