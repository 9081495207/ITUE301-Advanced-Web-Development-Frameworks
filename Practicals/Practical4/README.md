# Practical 4: Node/Express RESTful Task Management API & Middleware Pipeline

A complete RESTful backend server built with **Node.js** and **Express.js** implementing full CRUD endpoints, custom logging, request validation, 404 route handling, and global error handling middleware.

---

## 🎯 Objectives & Features

- **Full RESTful CRUD Operations**:
  - `GET /tasks` → Fetch all tasks (200 OK)
  - `GET /tasks/:id` → Fetch single task by ID (200 OK / 400 Bad Request / 404 Not Found)
  - `POST /tasks` → Create a new task (201 Created / 400 Bad Request / 415 Unsupported Media Type)
  - `PUT /tasks/:id` → Update existing task by ID (200 OK / 400 Bad Request / 404 Not Found)
  - `DELETE /tasks/:id` → Remove task by ID (200 OK / 404 Not Found)
- **Global Logging Middleware**: Logs `req.method`, `req.url`, and `timestamp` for every request.
- **Content-Type Validation Middleware**: Enforces `Content-Type: application/json` header on `POST` and `PUT` requests (returns `415 Unsupported Media Type`).
- **Route-specific ID Validation Middleware**: Validates that `:id` route parameter is a positive integer before hitting controller logic (returns `400 Bad Request`).
- **404 Undefined Route Middleware**: Returns a structured JSON payload for unknown endpoints.
- **Global Error Handling Middleware**: Catches unhandled exceptions, logs error stack trace, and returns `500 Internal Server Error` JSON payload.
- **Interactive Visual API Dashboard**: Built-in web client served at `http://localhost:5000` to test all endpoints and middleware rules directly in the browser.
- **Automated Integration Test Suite**: 100% test coverage using Node's native test runner (`npm test`).

---

## 📐 Architecture & Middleware Pipeline Flow

```
[ Client Request (Postman / Browser / cURL) ]
                    │
                    ▼
      [ 1. Request Logger Middleware ] ────── (Console: METHOD URL - ISO Timestamp)
                    │
                    ▼
      [ 2. Content-Type Validator ] ───────── (Enforces application/json for POST/PUT)
                    │
                    ▼
      [ 3. Express JSON Parser ] ──────────── (Parses JSON body into req.body)
                    │
                    ▼
      [ 4. Task Router (/tasks) ]
       ├── GET    /tasks             ──► [ taskController.getAllTasks ]
       ├── GET    /tasks/:id         ──► [ validateTaskId ] ──► [ taskController.getTaskById ]
       ├── POST   /tasks             ──► [ taskController.createTask ]
       ├── PUT    /tasks/:id         ──► [ validateTaskId ] ──► [ taskController.updateTask ]
       └── DELETE /tasks/:id         ──► [ validateTaskId ] ──► [ taskController.deleteTask ]
                    │
                    ▼
      [ 5. 404 Route Handler ] ────────────── (Returns 404 JSON for undefined routes)
                    │
                    ▼
      [ 6. Global Error Handler ] ─────────── (Returns 500 JSON for server exceptions)
```

---

## 📂 Project Structure

```
Practical4/
├── public/
│   └── index.html               # Interactive visual API dashboard & test console
├── src/
│   ├── controllers/
│   │   └── taskController.js    # Task CRUD controller logic
│   ├── data/
│   │   └── tasksStore.js        # In-memory tasks store
│   ├── middleware/
│   │   ├── logger.js            # Request logging middleware
│   │   ├── contentTypeValidator.js # Header validation middleware
│   │   ├── validateId.js        # ID validation middleware
│   │   ├── notFoundHandler.js   # 404 undefined route handler
│   │   └── errorHandler.js      # Global 500 error handler middleware
│   └── routes/
│       └── taskRoutes.js        # Express task router
├── test/
│   └── api.test.js              # Automated Node integration test suite
├── package.json
├── server.js                    # Express application entry point
└── README.md                    # Practical 4 documentation
```

---

## 🚀 Quick Start Guide

### 1. Installation & Dependencies

```bash
cd Practical4
npm install
```

### 2. Start the Server

```bash
# Start server on port 5000
npm start

# Or start in watch mode
npm run dev
```

Server output:
```
===================================================
🚀 Task Manager API Server running on port 5000
🌐 Visual API Dashboard: http://localhost:5000
📡 Base API Endpoint:    http://localhost:5000/tasks
===================================================
```

### 3. Run Automated Tests

```bash
npm test
```

---

## 🧪 Testing with cURL / Postman

### 1. Fetch All Tasks (`GET /tasks`)
```bash
curl -X GET http://localhost:5000/tasks
```
**Response (200 OK)**:
```json
{
  "status": 200,
  "count": 3,
  "data": [
    {
      "id": 1,
      "title": "Setup Node & Express Server",
      "description": "Initialize practical 4 directory and install Express dependencies.",
      "completed": true,
      "createdAt": "2026-08-19T02:00:00.000Z"
    }
  ]
}
```

### 2. Create a Task (`POST /tasks`)
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Implement REST Endpoints", "description": "Add CRUD controllers", "completed": false}'
```
**Response (201 Created)**:
```json
{
  "status": 201,
  "message": "Task created successfully.",
  "data": {
    "id": 4,
    "title": "Implement REST Endpoints",
    "description": "Add CRUD controllers",
    "completed": false,
    "createdAt": "2026-08-19T02:15:00.000Z"
  }
}
```

### 3. Update a Task (`PUT /tasks/1`)
```bash
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Express Server Title", "completed": true}'
```
**Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Task updated successfully.",
  "data": {
    "id": 1,
    "title": "Updated Express Server Title",
    "completed": true
  }
}
```

### 4. Delete a Task (`DELETE /tasks/1`)
```bash
curl -X DELETE http://localhost:5000/tasks/1
```
**Response (200 OK)**:
```json
{
  "status": 200,
  "message": "Task with ID 1 deleted successfully.",
  "data": { "id": 1, "title": "Setup Node & Express Server" }
}
```

### 5. Test Invalid ID Middleware (`GET /tasks/abc`)
```bash
curl -X GET http://localhost:5000/tasks/abc
```
**Response (400 Bad Request)**:
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid Task ID 'abc'. Task ID must be a positive integer."
}
```

### 6. Test Missing Content-Type Header (`POST /tasks`)
```bash
curl -X POST http://localhost:5000/tasks -d '{"title": "No Header"}'
```
**Response (415 Unsupported Media Type)**:
```json
{
  "status": 415,
  "error": "Unsupported Media Type",
  "message": "POST and PUT requests require 'Content-Type: application/json' header."
}
```

### 7. Test 404 Undefined Route Handler (`GET /unknown`)
```bash
curl -X GET http://localhost:5000/unknown
```
**Response (404 Not Found)**:
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Cannot GET /unknown. Route does not exist."
}
```

---

## 📊 Summary of HTTP Status Codes Used

| Status Code | Description | Trigger Scenario |
| :--- | :--- | :--- |
| **`200 OK`** | Request succeeded | Successful GET, PUT, DELETE operations |
| **`201 Created`** | Resource successfully created | Successful POST task creation |
| **`400 Bad Request`** | Client validation failure | Non-numeric Task ID or missing required `title` |
| **`404 Not Found`** | Resource or route missing | Non-existent Task ID or unregistered endpoint |
| **`415 Unsupported Media Type`** | Header mismatch | Missing `Content-Type: application/json` on POST/PUT |
| **`500 Internal Server Error`** | Global server exception | Caught unhandled error via global error handler |
