# Practical 2: Interactive React Application, State Management & Routing

## 📌 Overview
Practical 2 transforms the static portfolio into an interactive multi-page Single Page Application (SPA). It introduces client-side routing with `react-router-dom`, component state management using `useState`, interactive filtering, and controlled input forms.

---

## 🎯 Objectives
- Configure multi-page client-side routing using `BrowserRouter`, `Routes`, and `Route`.
- Implement dynamic state management with the `useState` hook.
- Add interactive project filtering by domain category.
- Create a controlled contact form with real-time preview.

---

## 🧩 Architecture & Routing Structure
```
App.jsx (BrowserRouter)
  ├── NavBar.jsx  (Active route indicators)
  └── Routes
       ├── /         → Home.jsx (Header + About + Skills)
       ├── /projects → Projects.jsx (Interactive category filtering)
       └── /contact  → Contact.jsx (Controlled form state)
```

---

## 📁 Key Files & Implementation
1. **`src/components/NavBar.jsx`**: Uses `NavLink` for active route highlight matching.
2. **`src/pages/Home.jsx`**: Assembles Practical 1 components into the main landing page.
3. **`src/pages/Projects.jsx`**: Uses `useState('All')` to filter projects dynamically by category (`AI & Healthcare`, `FinTech & Analytics`).
4. **`src/pages/Contact.jsx`**: Implements controlled inputs with React `useState` to capture form inputs and render a real-time message preview box.

---

## 🛠️ How to Run
```bash
# Run dev server
npm run dev
```
Navigate to `/projects` or `/contact` using the navigation bar.
