# Practical 3: Asynchronous REST API Integration & UI State Handling

## 📌 Overview
Practical 3 introduces asynchronous data fetching from a public REST API (GitHub API) into the React application. It demonstrates handling asynchronous lifecycles with `useEffect`, managing `loading` and `error` states, and rendering custom feedback UI components (`<Spinner />`, `<ErrorMessage />`, and `<RepoList />`).

---

## 🎯 Objectives
- Fetch public data dynamically from GitHub REST API (`https://api.github.com/users/<username>/repos`).
- Manage three distinct state variables: `repos`, `loading`, and `error`.
- Implement a CSS-animated `<Spinner />` component displayed while fetching.
- Implement an `<ErrorMessage />` component displayed if the API request fails.
- Map over response array data to render repository details (`name`, `html_url`, language, stars).

---

## 🧩 Component & Data Flow Architecture
```
Projects.jsx 
  ├── useEffect()  → triggers API fetch on mount
  ├── useState: repos, loading, error
  ├── [loading] → <Spinner />
  ├── [error]   → <ErrorMessage />
  └── [success] → <RepoList data={repos} />
```

---

## 📁 Key Files & Implementation
1. **`src/components/Spinner.jsx`**: CSS spinning indicator with accessible ARIA status markup.
2. **`src/components/ErrorMessage.jsx`**: Error card component rendering error messages.
3. **`src/components/RepoList.jsx`**: Maps over `repos` array to render repository cards with clickable `html_url` links.
4. **`src/pages/Projects.jsx`**:
   - `const [repos, setRepos] = useState([])`
   - `const [loading, setLoading] = useState(true)`
   - `const [error, setError] = useState(null)`
   - `useEffect()` lifecycle hook fetching GitHub repositories on mount.
   - Early conditional returns for loading and error states.

---

## 🧪 Verification & Testing
- **Happy Path**: Successfully fetches repository data on component mount.
- **Error Path**: Handles HTTP status failures (404, 403) or network errors gracefully with `<ErrorMessage />`.

---

## 🛠️ How to Run
```bash
# Run dev server
npm run dev
```
Open browser and navigate to the **Projects** page to view live GitHub API data.
