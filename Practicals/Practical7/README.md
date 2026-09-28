# Practical 7: Authentication and Middleware Pipeline

**Course**: ITUE301 - Advanced Web Development Frameworks  
**Topic**: JWT-Based Authentication, Password Hashing (`bcryptjs`), Protected Express Middleware Pipeline, and Input Validation  

---

## 📌 Overview

Practical 7 extends the Task Management application by building a secure **Authentication & Middleware Pipeline** in Express. User credentials are encrypted using `bcryptjs`, successful logins yield a signed **JSON Web Token (JWT)**, and all task routes are guarded by an authentication middleware that verifies the Bearer token.

---

## 🛠️ Architecture & Pipeline Flow

```
POST /auth/register → Hash Password (bcrypt cost 10) → Save User to MongoDB → 201 Created
POST /auth/login    → Verify Password (bcrypt.compare) → Sign JWT (1h Expiry) → Return Token + User

Protected Request Flow:
Client Request (Authorization: Bearer <token>)
   │
   ▼
[Auth Middleware (protect)] → Verifies JWT → Decodes user ID → Sets req.user
   │
   ▼
[Validation Middleware]     → Checks required fields (sanitizes input)
   │
   ▼
Controller Route Handler    → Performs MongoDB Operation (Scoped to req.user._id)
```

---

## 🚀 Key Features Implemented

1. **Secure Password Hashing (`bcryptjs`)**:
   - Encrypts user passwords before saving to MongoDB.
   - Password hashes are excluded from `toJSON()` serialization.

2. **JSON Web Token (JWT) Authorization (`jsonwebtoken`)**:
   - Generates signed JWTs with a 1-hour expiration.
   - Exposes `GET /auth/me` to retrieve current logged-in user profile from decoded JWT (**Supplementary Problem #1**).

3. **Authentication Middleware (`protect`)**:
   - Intercepts requests on `/tasks`.
   - Extracts and verifies Bearer token from `Authorization: Bearer <token>` header.
   - Rejects unauthenticated or expired requests with a structured `401 Unauthorized` JSON.

4. **Server-Side Input Validation Middleware**:
   - Validates email format, password min length (>= 6 chars), and required non-empty task titles before reaching controller logic.

5. **User-Scoped Database Operations**:
   - All tasks created in MongoDB are linked to the authenticated user's `ObjectId` (`user: req.user._id`).

---

## 📡 API Endpoints

### 🔑 Authentication Routes (`/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new user with hashed password & return JWT |
| `POST` | `/auth/login` | Public | Authenticate credentials & return JWT token |
| `GET` | `/auth/me` | Private (JWT) | Return current logged-in user profile (**Supplementary #1**) |

### 🔒 Task Routes (`/tasks`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | Private (JWT) | Fetch all tasks belonging to authenticated user |
| `GET` | `/tasks/:id` | Private (JWT) | Fetch single task by ID |
| `POST` | `/tasks` | Private (JWT) | Create new task scoped to authenticated user |
| `PUT` | `/tasks/:id` | Private (JWT) | Update task completion/priority state |
| `DELETE` | `/tasks/:id` | Private (JWT) | Delete task document from MongoDB |

---

## 💻 How to Run & Test

```bash
# 1. Navigate to Practical7 directory
cd Practical7

# 2. Install dependencies
npm install

# 3. Start Express + MongoDB server
npm start   # Starts server at http://localhost:5001

# 4. Run Automated Test Suite (10/10 Test Cases)
npm test
```
