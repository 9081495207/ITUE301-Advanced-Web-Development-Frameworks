# Practical 6: Full Stack Integration (React + Node + MongoDB)

## 📌 Course Information
- **Course Code**: ITUE301 - Advanced Web Development Frameworks
- **Topic**: Practical 6 - Full Stack Integration React + Node + MongoDB
- **CO / PO Mapping**: CO1, CO2 / PO3, PO5

---

## 🎯 Objective
To wire the React frontend UI (`http://localhost:5173`) to the Node/Express/MongoDB backend (`http://localhost:5000`) into a fully functional, end-to-end full-stack application supporting real-time data persistence, optimistic UI updates, delete confirmation dialogs, toast notifications, and comprehensive loading/error states.

---

## 🏗️ Full-Stack System Architecture

```
  ┌────────────────────────────────────────────────────────┐
  │         React Frontend Client (localhost:5173)         │
  │  ├── src/services/api.js (Central API helper)          │
  │  ├── src/pages/TaskManager.jsx (Optimistic Updates)    │
  │  ├── src/components/ConfirmModal.jsx (Delete Dialog)   │
  │  └── src/components/Toast.jsx (Status Alerts)          │
  └───────────────────────────┬────────────────────────────┘
                              │ HTTP Fetch Calls (cors enabled)
                              v
  ┌────────────────────────────────────────────────────────┐
  │          Node.js / Express Server (localhost:5000)     │
  │  ├── cors() Middleware                                 │
  │  ├── requestLogger & contentTypeValidator              │
  │  ├── taskRoutes (/tasks)                               │
  │  └── globalErrorHandler (Structured JSON Errors)       │
  └───────────────────────────┬────────────────────────────┘
                              │ Mongoose ODM
                              v
  ┌────────────────────────────────────────────────────────┐
  │                  MongoDB Database                      │
  │                  └── tasks collection                  │
  └────────────────────────────────────────────────────────┘
```

---

## ✨ Features Implemented

1. **Central API Service (`src/services/api.js`)**:
   - Encapsulates backend communication (`http://localhost:5000`) with methods `getTasks()`, `createTask()`, `updateTask()`, `deleteTask()`.

2. **Supplementary Problem #1: Optimistic UI Updates**:
   - Tasks are rendered in local state immediately upon creation before the server confirms, with automatic rollback if backend request fails.

3. **Supplementary Problem #2: Delete Confirmation Modal (`src/components/ConfirmModal.jsx`)**:
   - Displays a clean dialog prompting user confirmation before performing destructive delete operations.

4. **Supplementary Problem #3: Toast Notification Component (`src/components/Toast.jsx`)**:
   - Reusable toast notification banner displaying success or failure alerts after every CRUD action with auto-dismiss functionality.

5. **Data Persistence**:
   - All tasks are stored in MongoDB. Data persists across browser refreshes and server restarts.

---

## ⚡ How to Run Practical 6

### 1. Install & Start Backend (Port 5000)
```bash
cd Practical6
npm install
npm start
```

### 2. Start Frontend Dev Server (Port 5173)
```bash
# In top-level directory
npm run dev
```
Navigate to `http://localhost:5173/tasks` in your browser.

### 3. Run Automated Integration Test Suite
```bash
cd Practical6
npm test
```
