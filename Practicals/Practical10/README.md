# Practical 10: Asynchronous Processing with Event-Driven Architecture

## 📌 Metadata & Objectives

| Item | Details |
| :--- | :--- |
| **Course** | ITUE301 - Advanced Web Development Frameworks |
| **Practical** | Practical 10 |
| **CO / PO** | CO4 / PO3, PO5 |
| **Objective** | To implement asynchronous background processing using Node.js native `EventEmitter` without external dependencies. |
| **Prerequisites** | Practicals 4–9 completed working Node/Express/MongoDB backend; basic understanding of synchronous vs asynchronous execution in JavaScript. |
| **Tech Stack** | Node.js (v18+ built-in `events` module), Express.js, Mongoose / MongoDB |

---

## 🏗️ Architecture & Event Flow Diagram

```
POST /tasks Request
      │
      ▼
 Save Task to MongoDB Database
      │
      ├─────────────────────────────────────────┐
      ▼                                         ▼
Emit ('task-created', taskData)       API Responds Immediately (HTTP 201)
      │                                 Response Time: ~3ms
      ▼
Notification Listener (Asynchronous)
 ├── Log: Task Title & ID
 ├── Log: Timestamp (Start & Finish)
 └── Process Background Notification (Simulated 2s Delay)
```

---

## 📁 Directory Structure

```
Practical10/
├── events.js                 # Step 1: Dedicated EventEmitter subclass singleton
├── models/
│   ├── User.js               # User Mongoose schema & auth helpers
│   └── Task.js               # Task Mongoose schema
├── src/
│   ├── config/
│   │   └── db.js             # MongoDB connection with fallback in-memory server
│   ├── controllers/
│   │   ├── authController.js # Auth handlers (Register, Login, Me)
│   │   └── taskController.js # Step 3: Task CRUD handlers with EventEmitter calls
│   ├── events/
│   │   ├── events.js         # Re-exports EventEmitter instance
│   │   └── taskListeners.js  # Step 2 & Supplementary: Event listeners setup
│   ├── middleware/
│   │   └── authMiddleware.js # JWT authentication middleware
│   └── routes/
│       ├── authRoutes.js     # Auth API routes
│       └── taskRoutes.js     # Task API routes
├── test/
│   └── api.test.js           # Comprehensive automated test suite & timestamp verifier
├── .env                      # Environment configuration
├── package.json              # Project dependencies and test scripts
└── README.md                 # Lab documentation & analysis report
```

---

## 🚀 Lab Session Step-by-Step Implementation

### Step 1: Create Dedicated `events.js` Module

We extend Node.js's native `EventEmitter` class to create a custom event emitter instance for our application:

```javascript
// events.js
const EventEmitter = require('events');

class TaskEvents extends EventEmitter {}

const taskEvents = new TaskEvents();
module.exports = taskEvents;
```

### Step 2: Register Event Listeners (`taskListeners.js`)

Separate listeners are registered for handling domain events without cluttering request handlers:

```javascript
// src/events/taskListeners.js
const taskEvents = require('../../events');

const initTaskListeners = () => {
  // 1. task-created Listener
  taskEvents.on('task-created', (task) => {
    const startTimestamp = new Date().toISOString();
    console.log(`[Notification Listener START] Event triggered for Task "${task.title}" at ${startTimestamp}`);

    try {
      if (task.title && task.title.includes('TRIGGER_ERROR')) {
        throw new Error(`Failed to deliver notification for Task "${task.title}": Invalid recipient`);
      }

      const delayMs = task.delayMs !== undefined ? task.delayMs : 2000;

      setTimeout(() => {
        const finishTimestamp = new Date().toISOString();
        console.log(`[Notification Listener FINISHED] Task "${task.title}" (ID: ${task._id}, User: ${task.user}) processed background notification at ${finishTimestamp}`);
      }, delayMs);
    } catch (err) {
      taskEvents.emit('error', err);
    }
  });

  // 2. task-deleted Listener (Supplementary Problem 1)
  taskEvents.on('task-deleted', (task) => {
    const startTimestamp = new Date().toISOString();
    console.log(`[Deletion Listener START] Event triggered for deleted Task "${task.title}" at ${startTimestamp}`);

    setTimeout(() => {
      const finishTimestamp = new Date().toISOString();
      console.log(`[Deletion Listener FINISHED] Task "${task.title}" cleanup notification recorded at ${finishTimestamp}`);
    }, 1000);
  });

  // 3. error Listener (Supplementary Problem 2)
  taskEvents.on('error', (err) => {
    console.error(`[Error Listener CAUGHT] ❌ Event Handler Error: ${err.message}`);
  });
};

module.exports = { initTaskListeners };
```

### Step 3: Emit Events in Controller (`taskController.js`)

Inside `createTask` and `deleteTask`, events are emitted right after DB operations, allowing the controller to return HTTP responses immediately:

```javascript
// Inside createTask (POST /tasks)
const task = await Task.create({ ...req.body, user: req.user._id });

const apiTimestamp = new Date().toISOString();
console.log(`[API] Response sent at ${apiTimestamp}`);

// Send response immediately (HTTP 201)
res.status(201).json({
  status: 201,
  message: 'Task created successfully',
  apiResponseTimestamp: apiTimestamp,
  data: task
});

// Emit event asynchronously
taskEvents.emit('task-created', taskEventData);
```

---

## 🧪 Verification & Empirical Console Output Proof

Running `npm test` executes the test suite verifying non-blocking execution, timestamp ordering, and error catching.

### Recorded Console Execution Log:

```text
========================================================================
🧪 PRACTICAL 10: ASYNCHRONOUS EVENT-DRIVEN ARCHITECTURE TEST SUITE
========================================================================

✅ Connected to MongoMemoryServer: mongodb://127.0.0.1:42985/
✅ Test server running on http://localhost:54165

--- Step A: Authentication Setup ---
[2026-10-07T19:21:30.321Z] POST /auth/register 201 - 63ms
✅ Registered user and received JWT token.

========================================================================
⚡ STEP 3-6: DEMONSTRATING NON-BLOCKING EVENT EMISSION & TIMESTAMPS
========================================================================

🔹 Sending POST /tasks request with 1500ms background listener delay...
[API] Response sent at 2026-10-07T19:21:30.324Z
[Notification Listener START] Event triggered for Task "Asynchronous Background Processing Task" at 2026-10-07T19:21:30.324Z
[2026-10-07T19:21:30.324Z] POST /tasks 201 - 3ms
   [API Response Status] : 201
   [API Response Duration]: 2.67 ms
   [API Response Timestamp]: 2026-10-07T19:21:30.324Z

⏳ Waiting 2000ms for background notification listener to complete execution...
[Notification Listener FINISHED] Task "Asynchronous Background Processing Task" (ID: 6ac69bba725dbea427653a00, User: 6ac69bba725dbea4276539fd) processed background notification at 2026-10-07T19:21:31.825Z
✅ Background event processing completed.

========================================================================
🗑️ SUPPLEMENTARY PROBLEM 1: task-deleted EVENT LISTENER
========================================================================

🔹 Sending DELETE /tasks/6ac69bba725dbea427653a00 request...
[API] Delete response sent at 2026-10-07T19:21:32.332Z
[Deletion Listener START] Event triggered for deleted Task "Asynchronous Background Processing Task" at 2026-10-07T19:21:32.333Z
[2026-10-07T19:21:32.333Z] DELETE /tasks/6ac69bba725dbea427653a00 200 - 8ms
   [API Response Status]  : 200
   [API Response Duration] : 9.16 ms
   [API Response Timestamp]: 2026-10-07T19:21:32.332Z

⏳ Waiting 1200ms for background deletion listener to finish...
[Deletion Listener FINISHED] Task "Asynchronous Background Processing Task" cleanup notification recorded at 2026-10-07T19:21:33.334Z
✅ Background deletion handler completed.

========================================================================
🛡️ SUPPLEMENTARY PROBLEM 2: ERROR EVENT LISTENER HANDLING
========================================================================

🔹 Creating task with TRIGGER_ERROR in title...
[API] Response sent at 2026-10-07T19:21:33.542Z
[Notification Listener START] Event triggered for Task "TRIGGER_ERROR: Faulty Notification Task" at 2026-10-07T19:21:33.543Z
[Error Listener CAUGHT] ❌ Event Handler Error: Failed to deliver notification for Task "TRIGGER_ERROR: Faulty Notification Task": Invalid recipient
[2026-10-07T19:21:33.543Z] POST /tasks 201 - 6ms
   [API Response Status]  : 201 (API succeeds without crashing!)
   [API Response Duration] : 7.54 ms
✅ Error event caught by listener safely.

========================================================================
🐢 SUPPLEMENTARY PROBLEM 3: SIMULATING SLOW LISTENER (2000ms DELAY)
========================================================================

🔹 Sending POST /tasks request with 2000ms artificial delay...
[API] Response sent at 2026-10-07T19:21:33.548Z
[Notification Listener START] Event triggered for Task "Slow Notification Listener Task" at 2026-10-07T19:21:33.548Z
[2026-10-07T19:21:33.548Z] POST /tasks 201 - 4ms
   [API Response Status]  : 201
   [API Response Duration] : 4.83 ms (INSTANT RESPONSE!)
   [API Response Timestamp]: 2026-10-07T19:21:33.548Z

⏳ Waiting 2500ms for slow background handler to complete...
[Notification Listener FINISHED] Task "Slow Notification Listener Task" (ID: 6ac69bbd725dbea427653a08, User: 6ac69bba725dbea4276539fd) processed background notification at 2026-10-07T19:21:35.548Z
✅ Slow listener finished executing in background.

========================================================================
📋 SUMMARY TABLE OF API RESPONSE TIMES VS BACKGROUND COMPLETION
========================================================================
+----------------------------------+------------------+---------------------+
| Test Operation                   | API Response Time| Execution Mode      |
+----------------------------------+------------------+---------------------+
| POST /tasks (Standard Event)     | 2.67 ms          | Non-blocking Async  |
| DELETE /tasks/:id (Delete Event) | 9.16 ms          | Non-blocking Async  |
| POST /tasks (Error Simulation)   | 7.54 ms          | Non-blocking Async  |
| POST /tasks (2.0s Slow Listener) | 4.83 ms          | Non-blocking Async  |
+----------------------------------+------------------+---------------------+

========================================================================
🎉 ALL PRACTICAL 10 TESTS & VERIFICATIONS COMPLETED SUCCESSFULLY!
========================================================================
```

---

## 📊 Timestamp Proof Verification

From the console output, we observe:
- **API Response Timestamp**: `2026-10-07T19:21:30.324Z` (Response duration: `2.67 ms`)
- **Background Listener Completion Timestamp**: `2026-10-07T19:21:31.825Z`

**Conclusion**: The API response timestamp (`...:30.324Z`) is **1.5 seconds earlier** than the event listener's completion timestamp (`...:31.825Z`), proving that the client received the HTTP 201 response immediately while the background processing continued asynchronously.

---

## ❓ Key Questions & Analytical Answers

### Q1: Why does emitting an event not block the API response, even though both run on the same Node.js process?
**Answer**:
When `taskEvents.emit('task-created', task)` is invoked, Node.js calls registered listener callbacks synchronously. However, if the listener contains asynchronous operations (such as `setTimeout`, database calls, network HTTP requests to email providers, or file I/O), Node.js registers the async callback with libuv / the Event Loop timer queue and returns control immediately.
The API controller sends the HTTP response via `res.status(201).json(task)`, completing the HTTP request-response cycle on the call stack. The background listener callback is executed in a subsequent tick of the Node.js event loop once its timer/promise resolves. Thus, the client is never forced to wait for side-effect operations to finish.

### Q2: What would happen to API response time if the notification logic were placed directly inside the POST route instead of in an event handler?
**Answer**:
If notification processing (e.g., sending emails, external push notifications, or heavy processing taking 2 seconds) were embedded directly inside the `POST /tasks` controller route synchronously (e.g., using `await sendEmail()`), the HTTP response would be blocked until the email server responds.
- **Direct Synchronous Route**: API response time = `DB Save Time (~5ms)` + `Notification Time (2000ms)` = **~2005ms**.
- **Event-Driven Asynchronous Route**: API response time = `DB Save Time (~3ms)` + `Event Emission (~0.1ms)` = **~3.1ms**.
Placing side-effects inside event handlers decouples main request-response pathways from ancillary background tasks, producing a **~600x faster** API response time for clients.

### Q3: Why is `EventEmitter` a reasonable choice for this scale of application, but not for a production system handling millions of events per day?
**Answer**:
- **Why reasonable for single-node / small-scale apps**: Node.js `EventEmitter` is built into the runtime, requires zero external dependencies (no Redis/RabbitMQ infrastructure setup), zero network overhead, and has ultra-fast in-memory dispatch speed.
- **Why insufficient for high-scale / enterprise production (millions of events/day)**:
  1. **In-Memory Limitations**: Events exist only in process RAM. If the Node.js process crashes, restarts, or deploys new code while background listeners are waiting or executing, all pending events are permanently lost (no message persistence).
  2. **Single Process Scope**: `EventEmitter` cannot cross process or server boundaries. If the application is scaled across multiple server instances or Node.js cluster workers, events emitted on Worker A cannot be received by Worker B.
  3. **No Retries or Backpressure**: Built-in `EventEmitter` lacks dead-letter queues, rate limiting, automatic retry mechanisms, or acknowledgment tracking.
  4. **Production Alternative**: Enterprise systems use dedicated distributed message brokers (such as RabbitMQ, Apache Kafka, or BullMQ with Redis) which provide durable storage, message acknowledgement, cross-server distribution, and backpressure management.

---

## 🛠️ How to Run & Test

1. **Install Dependencies**:
   ```bash
   cd Practical10
   npm install
   ```

2. **Run Test Suite**:
   ```bash
   npm test
   ```

3. **Run Server in Development**:
   ```bash
   npm run dev
   ```
