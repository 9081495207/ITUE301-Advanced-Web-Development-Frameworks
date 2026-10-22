# Practical 11: Containerization with Docker and Docker Compose

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Author:** Jainam Kamani  
**Status:** Completed & Verified ✅  

---

## 📌 Objective

To containerize the full-stack Task Management Application using Docker and orchestrate all microservices (`frontend`, `backend`, and `mongodb`) seamlessly using Docker Compose.

---

## 🏗️ Architecture Overview

```
                      +-----------------------------------+
                      |           Host Browser            |
                      +-----------------------------------+
                               |                 |
                       Port 5173                 Port 5000
                               v                 v
            +-----------------------------------------------------+
            |                Docker Bridge Network                |
            |                    (app-network)                    |
            |                                                     |
            |   +-------------------+     +-------------------+   |
            |   |     frontend      |     |      backend      |   |
            |   | (React + Nginx)   |---->|  (Node / Express) |   |
            |   +-------------------+     +-------------------+   |
            |                                       |             |
            |                                       v             |
            |                             +-------------------+   |
            |                             |      mongodb      |   |
            |                             |    (Mongo 6.0)    |   |
            |                             +-------------------+   |
            |                                       |             |
            +---------------------------------------|-------------+
                                                    v
                                        +-----------------------+
                                        | Named Volume          |
                                        | (mongo-data)          |
                                        +-----------------------+
```

---

## 📁 Directory Structure

```
Practical11/
├── docker-compose.yml
├── .env
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── server.js
│   ├── events.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   └── taskController.js
│       ├── events/
│       │   ├── events.js
│       │   └── taskListeners.js
│       ├── middleware/
│       │   └── authMiddleware.js
│       └── routes/
│           ├── authRoutes.js
│           └── taskRoutes.js
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── services/
            └── api.js
```

---

## 🧠 Key Questions & In-Depth Analysis

### 1. Why does the backend container reference MongoDB by its service name (`mongodb`) rather than `localhost`?
* **Container Network Isolation:** Each Docker container runs inside its own network namespace with an isolated loopback interface (`127.0.0.1` / `localhost`). If the backend container attempts to connect to `localhost:27017`, it looks for a MongoDB process running inside the *backend container itself*, resulting in a `Connection Refused` error.
* **Docker DNS Resolution:** Docker Compose automatically creates an embedded DNS server within user-defined networks (`app-network`). It resolves container service names (e.g. `mongodb`) directly to the container's internal IP address assigned on `app-network`.

---

### 2. What is the difference between `EXPOSE` in a Dockerfile and `ports` mapping in `docker-compose.yml`?
| Feature | `EXPOSE` (Dockerfile) | `ports` (docker-compose.yml) |
| :--- | :--- | :--- |
| **Purpose** | Documentation & Metadata | Active Host-to-Container Port Publishing |
| **Accessibility** | Accessible **ONLY** inside the internal Docker network | Accessible **EXTERNALLY** from host machine & browser |
| **Example** | `EXPOSE 5000` | `ports: - "5000:5000"` |
| **Traffic Effect** | Does not open host firewall ports | Binds container port to host port (`HOST:CONTAINER`) |

---

### 3. Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?
* **Architecture Incompatibilities:** Native binary Node modules (e.g., C++ addons like `bcrypt` or `sharp`) compiled on host platforms (e.g., macOS ARM64 / Windows x64) fail to execute inside Linux Alpine Docker containers.
* **Image Bloat & Build Slowdown:** Copying pre-existing `node_modules` exponentially increases build context transfer time over Docker daemon socket.
* **Reproducibility:** Running `npm install` inside the Docker build pipeline guarantees fresh, architecture-matched, clean installations based strictly on `package.json` / `package-lock.json`.

---

## 🛠️ Supplementary Problems Implemented

1. **`.dockerignore` Optimization:** Added `.dockerignore` files to both `frontend/` and `backend/` to exclude `node_modules`, `.env`, `.git`, and build caches from the build context.
2. **Multi-Stage Frontend Docker Build:** Constructed a 2-stage build in `frontend/Dockerfile`:
   - **Stage 1 (Build):** Compiles Vite React application using `node:18-alpine`.
   - **Stage 2 (Production Serve):** Serves optimized static assets via `nginx:alpine` on port `80`, dramatically reducing image footprint.
3. **MongoDB Persistent Named Volume:** Configured named volume `mongo-data:/data/db` in `docker-compose.yml` so database state survives container restarts and tear-downs.

---

## 🚀 How to Run the Stack

### 1. Verify Docker & Docker Compose
```bash
docker --version
docker compose version
```

### 2. Build and Launch Containers
```bash
cd Practical11
docker compose up --build -d
```

### 3. Check Running Containers
```bash
docker ps
```

### 4. Access Application Endpoints
- **React Frontend:** [http://localhost:5173](http://localhost:5173)
- **Node.js / Express Backend:** [http://localhost:5000](http://localhost:5000)
- **MongoDB Connection:** `mongodb://localhost:27017/taskdb`

### 5. Stop Stack
```bash
docker compose down
```

---

## 📊 Verification Checkpoint

```bash
# Build Status:
✔ Container mongodb   Started
✔ Container backend   Started
✔ Container frontend  Started
```
All containers built cleanly, linked via `app-network`, and running end-to-end!
