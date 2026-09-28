# ITUE301: Advanced Web Development Frameworks - Practicals

This repository contains the practical assignments for **ITUE301 - Advanced Web Development Frameworks**, organized into separate folders for each practical exercise.

---

## 📂 Practicals Folder Structure

```
Practicals/
├── Practical1/     → Practical 1: Portfolio Component Architecture & Design System
├── Practical2/     → Practical 2: Interactive SPA, State Management (useState) & Routing
├── Practical3/     → Practical 3: Asynchronous REST API Integration (useEffect, Spinner, Error Handling)
├── Practical4/     → Practical 4: Express REST API Task Manager & Custom Middleware Pipeline
├── Practical5/     → Practical 5: MongoDB Integration and Schema Design with Mongoose
├── Practical6/     → Practical 6: Full Stack Integration (React + Node + MongoDB)
├── Practical7/     → Practical 7: Authentication & Middleware Pipeline (JWT, bcrypt, Protected Routes)
└── Practical8/     → Practical 8: Performance Optimization & Lazy Loading in React (Code Splitting, Suspense)
```

---

## 📚 Practical Documentation & Directories

| Practical Folder | Description | Readme Link |
| :--- | :--- | :--- |
| **[📁 Practical1](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical1)** | Portfolio Component Architecture & CSS Design System | 📖 [Practical1 README](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical1/README.md) |
| **[📁 Practical2](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical2)** | Interactive SPA, Routing (`react-router-dom`), Category Filter & Form Preview | 📖 [Practical2 README](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical2/README.md) |
| **[📁 Practical3](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical3)** | GitHub REST API Integration (`useEffect`, `useState`, `<Spinner />`, `<ErrorMessage />`, `<RepoList />`) | 📖 [Practical3 README](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical3/README.md) |
| **[📁 Practical4](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical4)** | RESTful Task API (Express, CRUD, Request Logger, Header Check, ID Validator, 404 & Global 500 Handler) | 📖 [Practical4 README](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical4/README.md) |
| **[📁 Practical5](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical5)** | Task API with MongoDB & Mongoose Schema Validation (Mongoose ODM, Schema Constraints, Async Controllers, Structured Error JSON) | 📖 [Practical5 README](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical5/README.md) |
| **[📁 Practical6](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical6)** | Full Stack Integration React + Node + MongoDB (Central `api.js`, CORS, Optimistic UI Updates, Confirm Dialog, Toast Alerts) | 📖 [Practical6 README](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical6/README.md) |
| **[📁 Practical7](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical7)** | Authentication & Middleware Pipeline (JWT Authorization `Bearer <token>`, Password Hashing `bcryptjs`, Server-Side Input Validation, `/auth/me` Profile Endpoint) | 📖 [Practical7 README](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical7/README.md) |
| **[📁 Practical8](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical8)** | Performance Optimization & Lazy Loading in React (`React.lazy()`, `<Suspense>`, Minimum Delay Fallback `lazyWithMinDelay`, Heavy Component Chunking) | 📖 [Practical8 README](file:///Users/kamanijainamrajeshkumar/Documents/ITUE301-Advanced%20Web%20Development%20Frameworks/Practicals/Practical8/README.md) |


---

## 🛠️ How to Run Any Practical

Navigate into any practical folder and start the dev server:

```bash
# To run Practical 7 (JWT Authentication & Middleware Pipeline)
cd Practical7
npm install
npm start   # Starts Node+Express+MongoDB backend at http://localhost:5002
npm test    # Runs automated end-to-end API & JWT test suite (10/10 test cases)

# Open another terminal window to start React frontend:
npm run dev # Access full-stack app at http://localhost:5173/tasks
```
