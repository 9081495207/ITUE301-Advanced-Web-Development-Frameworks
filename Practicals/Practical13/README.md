# Practical 13: AI API Integration into a Web Application

**CO6 / PO3, PO5, PO12** | Advanced Web Development Frameworks (ITUE301)

---

## Objective

Integrate an external AI service (OpenAI GPT-4o-mini) into the Task Management application to auto-generate meaningful task descriptions from a task title, while keeping the API key secure server-side and handling failures gracefully.

---

## Repository Structure for Practical 13

Like previous practicals, Practical 13 is fully self-contained with its own backend, frontend, docker orchestration, and environment configuration:

```
Practical13/
├── .env.example                     # Environment template (PORT, MONGO_URI, JWT_SECRET, OPENAI_API_KEY)
├── docker-compose.yml               # Multi-container orchestration (backend, frontend, mongodb)
├── README.md                        # Documentation & lab guide
├── backend/
│   ├── Dockerfile                   # Node.js container build
│   ├── package.json                 # Backend dependencies (express, mongoose, openai, jest)
│   ├── server.js                    # Express app mounting auth, task, and AI routes
│   ├── src/
│   │   ├── config/db.js             # Mongoose connection + In-Memory MongoDB fallback
│   │   ├── controllers/             # Auth and Task controller handlers
│   │   ├── middleware/              # JWT auth and error middleware
│   │   ├── models/                  # User and Task schemas
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /auth/register, /auth/login, /auth/me
│   │   │   ├── taskRoutes.js        # /tasks CRUD routes
│   │   │   └── aiRoutes.js          # POST /api/ai/generate-description (OpenAI integration)
│   │   └── events/                  # Event listeners and emitters
│   └── tests/
│       └── app.test.js              # Test suite including AI endpoint validation & graceful degradation
└── frontend/
    ├── Dockerfile                   # Multi-stage Nginx Vite build
    ├── nginx.conf                   # Reverse proxy configuration
    ├── package.json                 # Frontend dependencies (React, Vite)
    └── src/
        ├── services/
        │   └── api.js               # Frontend API service calling backend AI endpoint
        └── pages/
            └── TaskManager.jsx      # Task Manager with ✨ AI Generate button, loading spinner & disclaimer
```

---

## Architecture

```
React Frontend (TaskManager.jsx)
    │   User types a Task Title
    │   Clicks "✨ AI Generate" button
    ▼
Frontend API Service (src/services/api.js)
    │   POST /api/ai/generate-description   ← Express backend
    │   API key is NEVER sent from frontend
    ▼
Express Backend (backend/src/routes/aiRoutes.js)
    │   Reads OPENAI_API_KEY from process.env (.env)
    │   Rate limit: max 1 request per title per 60 seconds
    │   Calls OpenAI GPT-4o-mini
    ▼
OpenAI API (GPT-4o-mini)
    │
    ▼
Response parsed → description sent back → shown in task form as editable suggestion

On API failure: catch error → return { fallback: true } → app shows friendly toast & keeps working
```

---

## Setup & Running

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in `Practical13/`:
```bash
cp Practical13/.env.example Practical13/.env
```
Add your OpenAI API key in `Practical13/.env`:
```env
PORT=5000
MONGO_URI=mongodb://mongodb:27017/taskdb
JWT_SECRET=practical13_ai_integration_secret_key_2026
OPENAI_API_KEY=sk-proj-your-actual-key-here
```
*(Get your key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys). The file is already gitignored and will never be committed.)*

### 2. Run the Backend Locally
```bash
cd Practical13/backend
npm install
npm run dev
```

### 3. Run the Frontend Locally
```bash
cd Practical13/frontend
npm install
npm run dev
```

### 4. Run Automated Tests
```bash
cd Practical13/backend
npm test
```
All 11 tests will pass, including the AI description generation endpoint tests.

---

## How to Use the AI Feature

1. Navigate to the **Task Manager** page.
2. Log in (or use Quick Demo Login).
3. In the task creation form, **type a task title** (e.g., *"Set up Docker containerization with Nginx reverse proxy"*).
4. Click the **✨ AI Generate** button next to the Description label.
5. The button shows a **spinner** while waiting for the AI response.
6. The AI-generated description automatically populates the textarea.
7. A **🤖 AI-generated suggestion** disclaimer badge appears reminding you to review and edit.
8. Edit the description as needed, then click **✨ Add Task**.

---

## Key Features

### ✅ Secure API Key Handling
```js
// Backend only — API key never leaves the server
const apiKey = process.env.OPENAI_API_KEY;
const client = new OpenAI({ apiKey });
```

### ✅ Graceful Degradation
```js
// If OpenAI fails, the app continues working normally without crashing
} catch (err) {
  return res.status(200).json({
    description: '',
    fallback: true,
    fallbackReason: err.message
  });
}
```

### ✅ Rate Limiting (1 request / title / 60s)
```js
const RATE_LIMIT_MS = 60 * 1000;
if (isRateLimited(titleKey)) {
  return res.status(429).json({ error: 'Too Many Requests', fallback: true });
}
```

### ✅ AI Disclaimer in UI
When a description is AI-generated, a badge shows:
> 🤖 **AI-generated suggestion** — please review and edit before saving.

The disclaimer automatically disappears if the user manually edits the text.

---

## Responsible AI Considerations

| Concern | Our Implementation |
|---------|-------------------|
| **Privacy** | Only the task title is sent to OpenAI — no user PII |
| **Transparency** | AI disclaimer shown on every generated description |
| **Control** | Description is always editable — never accepted blindly |
| **Security** | API key is server-side only, never in browser DevTools |
| **Quota abuse** | Rate limiter prevents repeated rapid requests |

---

## Rubric Self-Assessment

| Criteria | Status |
|----------|--------|
| Dedicated Practical13 folder with backend & frontend | ✅ |
| AI API called from backend (key in `.env`) | ✅ |
| API key not exposed in frontend | ✅ |
| Meaningful AI feature (auto-generates task description) | ✅ |
| Graceful degradation when AI fails | ✅ |
| AI response displayed in UI (not raw JSON) | ✅ |
| AI disclaimer visible to user | ✅ |
| Rate limiting (supplementary) | ✅ |
| Loading state while waiting | ✅ |
