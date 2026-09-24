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
└── Practical6/     → Practical 6: Full Stack Integration (React + Node + MongoDB)
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

---

## 🛠️ How to Run Any Practical

Navigate into any practical folder and start the dev server:

```bash
# To run Practical 1
cd Practical1
npm install
npm run dev

# To run Practical 2
cd Practical2
npm install
npm run dev

# To run Practical 3
cd Practical3
npm install
npm run dev

# To run Practical 4
cd Practical4
npm install
npm start   # Starts server at http://localhost:5000 with visual API dashboard
npm test    # Runs automated integration test suite

# To run Practical 5
cd Practical5
npm install
npm start   # Starts server at http://localhost:5000 with MongoDB visual API dashboard
npm test    # Runs automated integration test suite against MongoDB/Mongoose

# To run Practical 6 (Full-Stack Integration)
cd Practical6
npm install
npm start   # Starts Node+Express+MongoDB backend at http://localhost:5000
npm test    # Runs automated end-to-end API test suite
# Open another terminal window to start React frontend:
npm run dev # Access full-stack app at http://localhost:5173/tasks
```

