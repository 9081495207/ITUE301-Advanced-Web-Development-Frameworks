# Practical 1: Portfolio Component Architecture & Design System

## 📌 Overview
Practical 1 focuses on designing and building the core component architecture for a personal developer portfolio application in React. It establishes a modular UI system with custom CSS styling and responsive layout blocks.

---

## 🎯 Objectives
- Divide the web application into modular, reusable React components.
- Establish a global CSS design system with CSS custom properties (variables).
- Build core portfolio sections: Header, Profile Summary, Skills, and Footer.

---

## 🧩 Component Architecture
```
App.jsx
  ├── Header.jsx   (Profile picture, name, taglines)
  ├── About.jsx    (Bio, highlights, academic focus)
  ├── Skills.jsx   (Categorized tech stack tags)
  └── Footer.jsx   (Social links, copyright, system info)
```

---

## 📁 Key Files & Implementation
1. **`src/components/Header.jsx`**: Renders profile picture, student title, and social metadata icons.
2. **`src/components/About.jsx`**: Renders bio cards, specialization details, and key highlights.
3. **`src/components/Skills.jsx`**: Renders tech stack badges categorized into Frontend, Backend, and Tools.
4. **`src/components/Footer.jsx`**: Renders footer navigation and copyright details.
5. **`src/index.css`**: Defines CSS tokens for themes (`--bg`, `--text`, `--border`, `--link`) and layout flex/grid utilities.

---

## 🛠️ How to Run
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev
```
