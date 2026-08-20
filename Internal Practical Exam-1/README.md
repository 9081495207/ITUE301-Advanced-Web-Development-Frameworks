# MedCare Plus — Hospital Appointment System

**Course:** ITUE301 — Advanced Web Development Frameworks  
**Examination:** Open-Book Practical Examination (Set A)

---

## Project Name
**Hospital Appointment System (MedCare Plus)**

---

## Folder Structure
```text
itue301-exam-[your-roll-number]-[batch]/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppointmentCard.jsx
│   │   │   └── Navigation.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── DoctorsPage.jsx
│   │   │   └── BookingPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── models/
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .env
├── .gitignore
└── README.md
```

---

## 1. Environment Variables Setup
Copy `.env.example` to `.env` in the root folder:
```bash
cp .env.example .env
```
Default configuration inside `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hospital_db
```

---

## 2. Backend Setup & Run Command
Navigate to the `backend/` directory:
```bash
cd backend
npm install
```
Start the server using node or npm:
```bash
node server.js
# OR
npm start
```
The server will run on `http://localhost:5000`.

---

## 3. Frontend Setup & Run Command
Navigate to the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will run on `http://localhost:3000`.

---

## 4. MongoDB Setup
Make sure local MongoDB is running:
```bash
mongod
# OR check service using mongosh
mongosh --eval "db.adminCommand('ping')"
```
Connection URL: `mongodb://127.0.0.1:27017/hospital_db`  
Initial sample doctors and appointments are seeded automatically upon first database connection.

---

## 5. Summary of Implemented Tasks
- **Task 1 (React Architecture):** Reusable `AppointmentCard` component accepting `patientName`, `doctorName`, `date`, `timeSlot`, `status` props with status-dependent CSS classes (`confirmed`, `pending`, `cancelled`).
- **Task 2 (Routing & State Management):** `react-router-dom` configuration (`/`, `/doctors`, `/booking`), `Navigation` component with `<Link>`, and appointment form with `useState` managing controlled inputs and real-time state reactivity preview.
- **Task 3 (Express REST API & Middleware):** REST endpoints (`GET /api/v1/appointments`, `POST /api/v1/appointments`, `GET /api/v1/doctors`), custom `requestLogger` middleware (`[METHOD] [PATH] [TIMESTAMP]`), and global error handling middleware returning structured JSON responses.
- **Task 4 (REST API Consumption in React):** Asynchronous API call to `GET /api/v1/doctors` in `DoctorsPage` using `useEffect` with three states (`data`, `loading`, `error`), rendering doctor details (`name`, `specialisation`, `available`).
- **Task 5 (MongoDB + Mongoose Schemas & Validation):** Schemas for `Patient`, `Doctor`, and `Appointment` with references and enum/length validation, connected via `.env`, and structured error responses for validation failures.
