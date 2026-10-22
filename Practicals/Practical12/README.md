# Practical 12: CI/CD Pipeline with GitHub Actions

**CO5 / PO3, PO5** | Advanced Web Development Frameworks (ITUE301)

---

## Objective

Automate testing and deployment of the Task Management application (from Practical 11) using a **GitHub Actions CI/CD pipeline** that runs on every push to the `main` branch.

---

## Architecture

```
git push origin main
         │
         ▼
GitHub Actions Trigger (on: push)
         │
    ┌────┴────┐
    │         │
    ▼         ▼
build-and-test  lint
    │
    ├─ Checkout code
    ├─ Setup Node.js 18
    ├─ npm install
    └─ npm test (Jest)
         │
         ▼
 ✅ Green checkmark (pass)
 ❌ Red X (fail)
```

---

## Files Created / Modified

| File | Purpose |
|------|---------|
| [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml) | GitHub Actions workflow — triggers on push to `main` |
| [`../Practical11/backend/tests/app.test.js`](../Practical11/backend/tests/app.test.js) | Jest + Supertest test suite |
| [`../Practical11/backend/package.json`](../Practical11/backend/package.json) | Added `test` script, `jest` + `supertest` dev deps |

---

## Test Suites

The test file covers four suites:

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
- Missing email → `400`
- Valid login → `200` with JWT token
- Wrong password → `401`

### 4. Full Authenticated Task CRUD
- Register → Login → GET /tasks → `200`
- POST /tasks with body → `201`

---

## GitHub Actions Workflow

```yaml
name: CI Pipeline

on:
  push:
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
        working-directory: Practical11/backend
      - run: npm test
        working-directory: Practical11/backend
```

---

## Running Tests Locally

```bash
cd Practical11/backend
npm test
```

Expected output — all tests green:
```
PASS tests/app.test.js
  GET / - Root Health Endpoint
    ✓ returns HTTP 200 and a JSON status object
  GET /tasks - Tasks Endpoint
    ✓ returns HTTP 401 when no auth token is provided
    ✓ returns HTTP 404 for a non-existent route
  POST /auth/register - User Registration
    ✓ registers a new user and returns HTTP 201
    ✓ returns HTTP 400 when email is missing
  POST /auth/login - User Login
    ✓ returns HTTP 200 and a JWT token on valid credentials
    ✓ returns HTTP 401 on invalid password
  Authenticated Task CRUD
    ✓ GET /tasks returns HTTP 200 for authenticated user
    ✓ POST /tasks creates a task and returns HTTP 201
```

---

## Demonstrating a Failed Pipeline (Lab Step 5)

To trigger a **deliberate failure**, change any `toBe(200)` to `toBe(500)` in `tests/app.test.js`, then push:

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
- ❌ Forgetting to push the workflow file itself
