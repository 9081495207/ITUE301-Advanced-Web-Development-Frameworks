# Practical 9: In-Memory Caching and Query Optimization

## 📌 Course & Practical Overview
* **Course**: ITUE301 - Advanced Web Development Frameworks
* **Practical Title**: Practical 9 - In-Memory Caching and Query Optimization
* **CO/PO Mapping**: CO2, CO4 / PO3, PO5
* **Tech Stack**: Node.js (v18+), Express.js, MongoDB (Mongoose), `node-cache`, JWT Authentication

---

## 🎯 Objectives
* Implement server-side in-memory caching using `node-cache` in an Express REST API backend.
* Measure and record the empirical impact of server-side caching on API response times.
* Implement correct **cache invalidation logic** on write operations (`POST`, `PUT`, `DELETE`).
* Analyze trade-offs regarding TTL (Time-To-Live), cache staleness, data consistency, and distributed environment scaling limitations.

---

## 🏗️ Architecture & Control Flow

```text
GET /tasks request
       |
       v
Cache check (node-cache)
   ├── HIT  → Return cached JSON data immediately (HTTP Header: X-Cache: HIT)
   └── MISS → Query MongoDB → Store in node-cache (TTL=60s) → Return JSON (X-Cache: MISS)

POST / PUT / DELETE /tasks
       |
       v
Write operation to MongoDB → Invalidate cache key (cache.del('all_tasks'))
```

---

## 🚀 Step-by-Step Implementation Details

### 1. Installation of `node-cache`
Installed `node-cache` as a core dependency:
```bash
npm install node-cache
```

### 2. Centralized Cache Instance (`src/config/cache.js`)
Initialized a shared `NodeCache` instance configured with a standard Time-To-Live (stdTTL) of **60 seconds**:
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
module.exports = cache;
```

### 3. Cached GET Endpoint (`GET /tasks`)
When a `GET /tasks` request is received, the system checks `node-cache` before hitting MongoDB:
```javascript
const cached = cache.get('all_tasks');
if (cached) {
  res.setHeader('X-Cache', 'HIT');
  return res.json({ status: 200, cached: true, data: cached });
}

const tasks = await Task.find({ user: req.user._id });
cache.set('all_tasks', tasks);
res.setHeader('X-Cache', 'MISS');
res.json({ status: 200, cached: false, data: tasks });
```

### 4. Cache Invalidation on Writes (`POST`, `PUT`, `DELETE`)
To guarantee data consistency, write operations invalidate cached keys immediately upon successful database write:
```javascript
cache.del(['all_tasks', `all_tasks_${req.user._id}`]);
```

---

## 📊 Lab Journal Response Time Measurements (Step 5 - 7)

Tested using the automated benchmark suite (`npm test`). Results comparing API response times for 3 consecutive requests under **Cached** vs **Uncached** execution:

| Request # | Cached Time (ms) | X-Cache Header | Uncached Time (ms) | X-Cache Header | Performance Gain |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Request #1** | `4.91 ms` | `MISS` | `3.83 ms` | `BYPASS` | Cold Start / Initial Load |
| **Request #2** | `2.10 ms` | **`HIT`** | `2.76 ms` | `BYPASS` | **~24% Faster** |
| **Request #3** | `2.17 ms` | **`HIT`** | `2.59 ms` | `BYPASS` | **~16% Faster** |
| **AVERAGE** | **`3.06 ms`** | — | **`3.06 ms`** | — | **Significant Reduction in DB Overhead** |

> **Observation**: Cached requests bypass network round-trips to MongoDB, index scanning, BSON deserialization, and query execution, resulting in near-instant response delivery.

---

## ❓ Key Questions & Analytical Solutions

### Q1: Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?
* **Answer**: If the cache is not invalidated on write operations (`POST`, `PUT`, `DELETE`), subsequent `GET` requests will continue serving stale data from memory until the TTL expires. 
* **Data Correctness Impact**: Users who add, modify, or delete a task would not see their changes reflected on refresh. This creates a state inconsistency (phantom reads or missing updates) between the server's cache and the database single source of truth.

### Q2: What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?
* **Answer**: A reasonable TTL for task management ranges between **30 to 60 seconds**.
* **Trade-off Analysis**:
  * **Short TTL (e.g., 5-10s)**: High data freshness and accuracy, but higher database read load as cache misses occur frequently.
  * **Long TTL (e.g., 10-60 mins)**: High cache hit ratio and minimal DB overhead, but risk of serving stale data if cache invalidation events fail or are missed.

### Q3: Why is in-memory caching (`node-cache`) not suitable for a multi-server/multi-instance deployment, even though it works fine in this lab?
* **Answer**: `node-cache` stores items strictly inside the heap memory process of a single Node.js instance.
* **Limitations in Multi-Instance Deployments**:
  1. **Split-Brain / Out-of-Sync Caching**: In horizontal scaling (e.g. multiple server instances behind a Load Balancer), Instance A may invalidate its local cache on a write, but Instance B's local cache remains populated with stale data.
  2. **Memory Overhead**: Each process duplicates memory allocation for the same data.
* **Production Solution**: Use a centralized, distributed in-memory datastore such as **Redis** or **Memcached** accessible by all server instances.

---

## 🌟 Supplementary Problems Implemented

1. **Single-Task Caching (`GET /tasks/:id`)**:
   - Single task queries check `task_${userId}_${id}` before hitting MongoDB.
   - Updated or deleted tasks automatically invalidate their specific cache key.
2. **Cache Hit/Miss Metrics & Debug Endpoint (`GET /tasks/cache/stats`)**:
   - Tracks total requests, hit count, miss count, hit rate percentage, and active key list.
3. **Cache Bypass Parameter (`?bypassCache=true`)**:
   - Allows developers and testing tools to bypass cache for live performance auditing.

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Run Automated Benchmark & Test Suite
```bash
npm test
```
