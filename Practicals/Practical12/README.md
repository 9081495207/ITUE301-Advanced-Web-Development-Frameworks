# Practical 12: CI/CD Pipeline with GitHub Actions

**CO5 / PO3, PO5** | Advanced Web Development Frameworks (ITUE301)

---

## Objective

Automate testing and continuous integration of the full-stack Task Management application using a **GitHub Actions CI/CD pipeline** that runs on every push to the `main` branch.

---

## Repository Structure for Practical 12

This practical is self-contained with its own backend, frontend, docker orchestration, and CI workflow:

```
Practical12/
├── .env.example                     # Environment template (PORT, MONGO_URI, JWT_SECRET)
├── docker-compose.yml               # Multi-container orchestration (backend, frontend, mongodb)
├── README.md                        # Documentation & lab guide
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions pipeline definition
├── backend/
│   ├── Dockerfile                   # Node.js container build
│   ├── package.json                 # Backend dependencies, Jest & Supertest
│   ├── server.js                    # Express app with event-driven architecture
│   ├── src/
│   │   ├── config/db.js             # Mongoose connection + In-Memory MongoDB fallback
│   │   ├── controllers/             # Auth and Task controller handlers
│   │   ├── middleware/              # JWT auth and error middleware
│   │   ├── models/                  # User and Task schemas
│   │   ├── routes/                  # Express routes (/auth, /tasks)
│   │   └── events/                  # Event listeners and emitters
│   └── tests/
│       └── app.test.js              # Complete Jest + Supertest automated test suite
└── frontend/
    ├── Dockerfile                   # Multi-stage Nginx Vite build
    ├── nginx.conf                   # Reverse proxy configuration
    ├── package.json                 # Frontend dependencies (React, Vite)
    └── src/                         # Full React Task Manager UI
```

---

## Architecture

```
git push origin main
         │
         ▼
GitHub Actions Trigger (on: push / PR)
         │
    ┌────┴────┐
    │         │
    ▼         ▼
build-and-test  lint
    │
    ├─ Checkout repository (actions/checkout@v4)
    ├─ Setup Node.js 18 (actions/setup-node@v4)
    ├─ npm install (in Practicals/Practical12/backend)
    └─ npm test (Jest + Supertest against In-Memory MongoDB)
         │
         ▼
 ✅ Green checkmark (all 9 tests pass)
 ❌ Red cross (fails if any assertion breaks)
```

---

## Test Suites

The test file `tests/app.test.js` covers four core test suites:

### 1. Root Health Endpoint
```js
test('returns HTTP 200 and a JSON status object', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
});
```

### 2. Task Endpoints (Auth Protected)
```js
test('returns HTTP 401 when no auth token is provided', async () => {
  const res = await request(app).get('/tasks');
  expect(res.statusCode).toBe(401);
});
```

### 3. Auth Endpoints (Register + Login)
- Successful registration → `201`
- Missing required fields → `400`
- Valid login → `200` with JWT token
- Wrong password → `401`

### 4. Full Authenticated Task CRUD
- Register → Login → GET /tasks → `200`
- POST /tasks with body → `201`

---

## GitHub Actions Workflow (`ci.yml`)

```yaml
name: CI Pipeline - Practical 12

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
        working-directory: Practicals/Practical12/backend
      - run: npm test
        working-directory: Practicals/Practical12/backend
        env:
          NODE_ENV: test
```

---

## Running Tests Locally

```bash
# Navigate to Practical 12 backend
cd Practical12/backend

# Run test suite
npm test
```

Expected output — all tests green:
```
PASS tests/app.test.js
  GET / - Root Health Endpoint
    ✓ returns HTTP 200 and a JSON status object (20 ms)
  GET /tasks - Tasks Endpoint (unauthenticated)
    ✓ returns HTTP 401 when no auth token is provided (8 ms)
    ✓ returns HTTP 404 for a non-existent route (2 ms)
  POST /auth/register - User Registration
    ✓ registers a new user and returns HTTP 201 (76 ms)
    ✓ returns HTTP 400 when email is missing (3 ms)
  POST /auth/login - User Login
    ✓ returns HTTP 200 and a JWT token on valid credentials (54 ms)
    ✓ returns HTTP 401 on invalid password (53 ms)
  Authenticated Task CRUD
    ✓ GET /tasks returns HTTP 200 for an authenticated user (9 ms)
    ✓ POST /tasks creates a task and returns HTTP 201 (8 ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

---

## Demonstrating a Failed Pipeline (Lab Step 5)

To trigger a **deliberate failure**, change any `toBe(200)` to `toBe(500)` in `Practical12/backend/tests/app.test.js`, then commit and push:

```js
// Before (passes ✅)
expect(res.statusCode).toBe(200);

// After — deliberate failure (fails ❌)
expect(res.statusCode).toBe(500);
```

Push to `main` → GitHub Actions shows a **red ✗**. Revert the change → push again → pipeline turns **green ✓**.

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| **CI (Continuous Integration)** | Automatically test code on every commit |
| **CD (Continuous Deployment)** | Automatically deploy after tests pass |
| **This practical demonstrates** | CI — automated testing on push |
| **GitHub Actions trigger** | `on: push: branches: [main]` |
| **In-memory MongoDB** | No external DB needed in CI (uses `mongodb-memory-server`) |
| **Jest** | JavaScript testing framework |
| **Supertest** | HTTP assertion library for Express apps |

---

## Common Mistakes to Avoid

- ❌ Placing the workflow in the wrong path (must be `.github/workflows/<name>.yml`)
- ❌ Incorrect YAML indentation → workflow fails to register on GitHub
- ❌ Writing a test that always passes trivially (`expect(true).toBe(true)`)
- ❌ Forgetting to commit and push the workflow file itself
