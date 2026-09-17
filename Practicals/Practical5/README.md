# Practical 5: MongoDB Integration and Schema Design with Mongoose

## 📌 Course Information
- **Course Code**: ITUE301 - Advanced Web Development Frameworks
- **Topic**: Practical 5 - MongoDB Integration and Schema Design with Mongoose
- **CO / PO Mapping**: CO2, CO3 / PO3, PO5

---

## 🎯 Objective
To connect a MongoDB database to an Express REST API server and enforce strict data validation rules through Mongoose schema definitions, handling Mongoose validation and cast errors as clean, structured JSON.

---

## 🏗️ Architecture & Component Flow

```
   ┌────────────────────────────────────────────────────────┐
   │                  HTTP Client (Postman/Web UI)          │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP Request (JSON Body)
                               v
   ┌────────────────────────────────────────────────────────┐
   │                   Express.js Server                    │
   │ ├── express.static('public')                           │
   │ ├── requestLogger Middleware                           │
   │ ├── validateContentType Middleware                     │
   │ └── express.json() Body Parser                         │
   └───────────────────────────┬────────────────────────────┘
                               │ Forward to Router /tasks
                               v
   ┌────────────────────────────────────────────────────────┐
   │                    taskController                      │
   │  Uses Async/Await Mongoose CRUD operations             │
   └───────────────────────────┬────────────────────────────┘
                               │ Schema Validation & Query
                               v
   ┌────────────────────────────────────────────────────────┐
   │                    Mongoose ODM                        │
   │   Task Model Schema (title, description, completed,    │
   │                      createdAt)                        │
   └───────────────────────────┬────────────────────────────┘
                               │ Mongo Wire Protocol
                               v
   ┌────────────────────────────────────────────────────────┐
   │                  MongoDB Database                      │
   │                  └── tasks collection                  │
   └────────────────────────────────────────────────────────┘
```

---

## 🛠️ Data Model & Schema Validation Rules

The Mongoose `Task` model is defined in [`models/Task.js`](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical5/models/Task.js):

| Field | Type | Validation / Constraints | Default Value |
| :--- | :--- | :--- | :--- |
| **`title`** | `String` | **Required**, non-empty trimmed string | *None (Throws ValidationError if missing)* |
| **`description`** | `String` | Optional trimmed string | `""` (empty string) |
| **`completed`** | `Boolean` | Enforced boolean flag | `false` |
| **`createdAt`** | `Date` | Timestamp | `Date.now` |
| **`_id`** | `ObjectId` | Auto-generated 24-character hexadecimal MongoDB primary key | *Auto-generated* |

---

## 📡 REST API Endpoint Documentation

| Method | Endpoint | Description | Request Body Example | Success Response | Error Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/tasks` | Fetch all tasks sorted by `createdAt` | *None* | `200 OK` (Task Array) | `500 Internal Server Error` |
| **`POST`** | `/tasks` | Create a new task (Mongoose validation enforced) | `{"title": "Buy milk", "description": "2% organic"}` | `201 Created` (New Task) | `400 Bad Request` (Validation Error) |
| **`GET`** | `/tasks/:id` | Fetch task by MongoDB ObjectId | *None* | `200 OK` (Single Task) | `400 Invalid ID` / `404 Not Found` |
| **`PUT`** | `/tasks/:id` | Update task details by ObjectId | `{"completed": true}` | `200 OK` (Updated Task) | `400 Bad Request` / `404 Not Found` |
| **`DELETE`**| `/tasks/:id` | Delete task by ObjectId | *None* | `200 OK` (Deleted Task) | `400 Invalid ID` / `404 Not Found` |
| **`GET`** | `/tasks/trigger-error` | Test 500 error handling middleware | *None* | N/A | `500 Internal Server Error` |

---

## ⚡ Setup & Execution Instructions

### 1. Install Dependencies
```bash
cd Practical5
npm install
```

### 2. Configure Environment Variables
A `.env` file is created automatically:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager_db
```

> **Note**: If no local MongoDB server or Mongo URI is available, the app automatically falls back to an **In-Memory MongoDB Server** (`mongodb-memory-server`), requiring zero external database configuration!

### 3. Start Server
```bash
# Production / Standard start
npm start

# Development mode (with live watch)
npm run dev
```

Server will start on `http://localhost:5000`. Open your browser to view the **Visual Interactive API Dashboard**.

### 4. Run Automated Test Suite
```bash
npm test
```

---

## 🧪 Postman Testing Instructions

1. **`POST /tasks` (Valid Task)**:
   - URL: `http://localhost:5000/tasks`
   - Header: `Content-Type: application/json`
   - Body: `{"title": "Submit Practical 5 Assignment", "description": "MongoDB & Mongoose schema design"}`
   - **Expected Status**: `201 Created`

2. **`POST /tasks` (Trigger Mongoose Validation Error)**:
   - Body: `{"description": "No title specified"}`
   - **Expected Status**: `400 Bad Request`
   - **Structured Response**:
     ```json
     {
       "status": 400,
       "error": "Validation Error",
       "message": "Task title is required.",
       "details": [
         { "field": "title", "message": "Task title is required." }
       ]
     }
     ```

3. **`GET /tasks/invalid-id-format` (Trigger CastError)**:
   - URL: `http://localhost:5000/tasks/xyz123`
   - **Expected Status**: `400 Bad Request`
   - **Structured Response**:
     ```json
     {
       "status": 400,
       "error": "Invalid ID Format",
       "message": "The provided ID 'xyz123' is not a valid 24-character hexadecimal MongoDB ObjectId."
     }
     ```
