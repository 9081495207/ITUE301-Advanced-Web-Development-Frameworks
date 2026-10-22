# Practical 13: AI API Integration into a Web Application

**CO6 / PO3, PO5, PO12** | Advanced Web Development Frameworks (ITUE301)

---

## Objective

Integrate an external AI service (OpenAI GPT-4o-mini) into the Task Management application to auto-generate meaningful task descriptions from a task title, while keeping the API key secure server-side and handling failures gracefully.

---

## Architecture

```
React Frontend (TaskManager.jsx)
    │   User types a Task Title
    │   Clicks "✨ AI Generate" button
    ▼
Frontend API Service (src/services/api.js)
    │   POST /api/ai/generate-description   ← your own backend (JWT optional)
    │   API key is NEVER sent from frontend
    ▼
Express Backend (Practical11/backend/src/routes/aiRoutes.js)
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

## Files Created / Modified

| File | Change |
|------|--------|
| [`../Practical11/backend/src/routes/aiRoutes.js`](../Practical11/backend/src/routes/aiRoutes.js) | **NEW** — AI route with rate limiting & graceful degradation |
| [`../Practical11/backend/server.js`](../Practical11/backend/server.js) | Imported & mounted `aiRoutes` at `/api/ai` |
| [`../Practical11/.env`](../Practical11/.env) | Added `OPENAI_API_KEY` placeholder |
| [`../src/services/api.js`](../src/services/api.js) | Added `generateDescription()` function |
| [`../src/pages/TaskManager.jsx`](../src/pages/TaskManager.jsx) | Added AI button, loading spinner, disclaimer badge, graceful fallback UI |

---

## Setup

### 1. Get an OpenAI API key
Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) and create a key.

### 2. Add it to `.env` (never commit this!)
```env
# Practical11/.env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```

### 3. Start the backend
```bash
cd Practical11/backend
npm run dev
```

### 4. Start the frontend
```bash
# from the root Practicals directory
npm run dev
```

---

## How to Use the AI Feature

1. Navigate to the **Task Manager** page
2. Log in (or use Quick Demo Login)
3. In the task creation form, **type a task title** (e.g. "Write unit tests for authentication")
4. Click the **✨ AI Generate** button next to the Description label
5. The button shows a **spinner** while waiting for the AI response
6. The AI-generated description fills the textarea
7. A **🤖 AI-generated suggestion** disclaimer appears — reminding you to review it
8. Edit the description as needed, then click **✨ Add Task**

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
// If OpenAI fails, the app continues working normally
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

The disclaimer disappears if the user manually edits the text.

---

## Testing the Failure Path (Lab Step 6)

To demonstrate graceful degradation with an invalid API key:

1. In `Practical11/.env`, change the key to something invalid:
   ```env
   OPENAI_API_KEY=sk-invalid-key-for-testing
   ```
2. Restart the backend: `npm run dev`
3. Click "✨ AI Generate" in the UI
4. The app shows a toast: *"AI service temporarily unavailable. You can type a description manually."*
5. The task form **remains fully functional** — the AI failure does not break anything

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
| AI API called from backend (key in `.env`) | ✅ |
| API key not exposed in frontend | ✅ |
| Meaningful AI feature (auto-generates task description) | ✅ |
| Graceful degradation when AI fails | ✅ |
| AI response displayed in UI (not raw JSON) | ✅ |
| AI disclaimer visible to user | ✅ |
| Rate limiting (supplementary) | ✅ |
| Loading state while waiting | ✅ |
