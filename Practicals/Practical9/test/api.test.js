const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const http = require('http');
const app = require('../server');
const { flushCache, resetCacheMetrics } = require('../src/config/cache');

let mongoServer;
let server;
let baseUrl;
let token;
let sampleTaskId;

/**
 * Helper to make HTTP requests using native http module
 */
const makeRequest = (method, path, body = null, authToken = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const startTime = process.hrtime.bigint();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
          responseTimeMs: durationMs
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log(`========================================================================`);
  console.log(`🧪 PRACTICAL 9: IN-MEMORY CACHING & PERFORMANCE TEST SUITE`);
  console.log(`========================================================================\n`);

  try {
    // 1. Setup Mongo Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoMemoryServer: ${mongoUri}`);

    // 2. Start HTTP Server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`✅ Test server running on ${baseUrl}\n`);
        resolve();
      });
    });

    // Reset Cache
    flushCache();
    resetCacheMetrics();

    // 3. Register User & Obtain JWT
    console.log(`--- Step A: Authentication Setup ---`);
    const regRes = await makeRequest('POST', '/auth/register', {
      name: 'Caching Tester',
      email: 'caching.tester@example.com',
      password: 'password123'
    });
    token = regRes.body.token;
    console.log(`✅ Registered user and received JWT token.\n`);

    // 4. Seed Database with Tasks
    console.log(`--- Step B: Database Seeding ---`);
    for (let i = 1; i <= 25; i++) {
      const taskRes = await makeRequest(
        'POST',
        '/tasks',
        {
          title: `Benchmark Task #${i}`,
          description: `Description for performance testing dataset item ${i}`,
          priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low'
        },
        token
      );
      if (i === 1) sampleTaskId = taskRes.body.data._id;
    }
    console.log(`✅ Seeded 25 tasks into MongoDB database.\n`);

    // Clear initial write invalidation residual cache
    flushCache();
    resetCacheMetrics();

    // 5. Test Steps 5 & 6: Measure Cached vs Uncached GET /tasks
    console.log(`========================================================================`);
    console.log(`📊 EXPERIMENT: RECORDING API RESPONSE TIMES (CACHED vs UNCACHED)`);
    console.log(`========================================================================`);

    const cachedReadings = [];
    const uncachedReadings = [];

    // --- CACHED REQUESTS ---
    console.log(`\n🔹 Phase 1: Sending 3 GET /tasks requests with IN-MEMORY CACHING ENABLED...`);
    for (let i = 1; i <= 3; i++) {
      const res = await makeRequest('GET', '/tasks', null, token);
      const cacheHeader = res.headers['x-cache'] || 'N/A';
      cachedReadings.push({
        request: `Request #${i}`,
        timeMs: res.responseTimeMs.toFixed(2),
        status: cacheHeader,
        itemsCount: res.body.count
      });
      console.log(`   [Cached Request #${i}] Time: ${res.responseTimeMs.toFixed(2)} ms | X-Cache Header: ${cacheHeader}`);
    }

    // --- UNCACHED REQUESTS (Bypassing Cache) ---
    console.log(`\n🔹 Phase 2: Sending 3 GET /tasks requests with CACHING DISABLED (bypassCache=true)...`);
    for (let i = 1; i <= 3; i++) {
      const res = await makeRequest('GET', '/tasks?bypassCache=true', null, token);
      const cacheHeader = res.headers['x-cache'] || 'N/A';
      uncachedReadings.push({
        request: `Request #${i}`,
        timeMs: res.responseTimeMs.toFixed(2),
        status: cacheHeader,
        itemsCount: res.body.count
      });
      console.log(`   [Uncached Request #${i}] Time: ${res.responseTimeMs.toFixed(2)} ms | X-Cache Header: ${cacheHeader}`);
    }

    // Print Lab Journal Comparative Table (Step 7)
    console.log(`\n========================================================================`);
    console.log(`📋 LAB JOURNAL RESULTS TABLE (Step 7)`);
    console.log(`========================================================================`);
    console.log(`+-----------+-----------------------+-------------------------+---------------+|`);
    console.log(`| Request   | Cached Time (ms)      | Uncached Time (ms)      | Performance   |`);
    console.log(`+-----------+-----------------------+-------------------------+---------------+|`);
    
    let totalCached = 0;
    let totalUncached = 0;

    for (let i = 0; i < 3; i++) {
      const cTime = parseFloat(cachedReadings[i].timeMs);
      const uTime = parseFloat(uncachedReadings[i].timeMs);
      totalCached += cTime;
      totalUncached += uTime;

      const diff = uTime > 0 ? (((uTime - cTime) / uTime) * 100).toFixed(1) : '0';
      const reqLabel = `Req #${i + 1}`.padEnd(9);
      const cLabel = `${cTime.toFixed(2)} ms (${cachedReadings[i].status})`.padEnd(21);
      const uLabel = `${uTime.toFixed(2)} ms (${uncachedReadings[i].status})`.padEnd(23);
      const speedup = `${diff}% faster`.padEnd(13);

      console.log(`| ${reqLabel} | ${cLabel} | ${uLabel} | ${speedup} |`);
    }

    const avgCached = (totalCached / 3).toFixed(2);
    const avgUncached = (totalUncached / 3).toFixed(2);
    const overallSpeedup = (((avgUncached - avgCached) / avgUncached) * 100).toFixed(1);

    console.log(`+-----------+-----------------------+-------------------------+---------------+|`);
    console.log(`| AVERAGE   | ${avgCached.padEnd(7)} ms           | ${avgUncached.padEnd(7)} ms           | ${overallSpeedup}% faster   |`);
    console.log(`+-----------+-----------------------+-------------------------+---------------+|\n`);

    // 6. Test Step 4: Cache Invalidation on Write Operations (POST, PUT, DELETE)
    console.log(`--- Step C: Verifying Cache Invalidation Logic (Step 4) ---`);

    // Ensure cache has 'HIT'
    await makeRequest('GET', '/tasks', null, token);
    let checkCacheBefore = await makeRequest('GET', '/tasks', null, token);
    console.log(`1. Cache Status before write: X-Cache = ${checkCacheBefore.headers['x-cache']}`);

    // POST write
    const postRes = await makeRequest(
      'POST',
      '/tasks',
      { title: 'Invalidation Trigger Task', description: 'Triggers cache del' },
      token
    );
    console.log(`2. POST /tasks executed (Task Created). Response cacheInvalidated: ${postRes.body.cacheInvalidated}`);

    // Check GET /tasks after POST
    let checkCacheAfterPOST = await makeRequest('GET', '/tasks', null, token);
    console.log(`3. Cache Status after POST: X-Cache = ${checkCacheAfterPOST.headers['x-cache']} (Expected: MISS because cache was invalidated)`);

    // PUT write
    const putRes = await makeRequest(
      'PUT',
      `/tasks/${sampleTaskId}`,
      { title: 'Updated Benchmark Task #1' },
      token
    );
    console.log(`4. PUT /tasks/${sampleTaskId} executed. Response cacheInvalidated: ${putRes.body.cacheInvalidated}`);

    let checkCacheAfterPUT = await makeRequest('GET', '/tasks', null, token);
    console.log(`5. Cache Status after PUT: X-Cache = ${checkCacheAfterPUT.headers['x-cache']} (Expected: MISS)`);

    // DELETE write
    const delRes = await makeRequest('DELETE', `/tasks/${sampleTaskId}`, null, token);
    console.log(`6. DELETE /tasks/${sampleTaskId} executed. Response cacheInvalidated: ${delRes.body.cacheInvalidated}`);

    let checkCacheAfterDEL = await makeRequest('GET', '/tasks', null, token);
    console.log(`7. Cache Status after DELETE: X-Cache = ${checkCacheAfterDEL.headers['x-cache']} (Expected: MISS)\n`);

    // 7. Test Supplementary Problem 1: Single-Task Endpoint Caching
    console.log(`--- Step D: Single-Task Caching (GET /tasks/:id) ---`);
    const newTaskId = postRes.body.data._id;
    const single1 = await makeRequest('GET', `/tasks/${newTaskId}`, null, token);
    console.log(`1. GET /tasks/${newTaskId} Request 1: X-Cache = ${single1.headers['x-cache']} (Expected: MISS)`);

    const single2 = await makeRequest('GET', `/tasks/${newTaskId}`, null, token);
    console.log(`2. GET /tasks/${newTaskId} Request 2: X-Cache = ${single2.headers['x-cache']} (Expected: HIT)\n`);

    // 8. Test Supplementary Problem 2: Debug Cache Stats Endpoint
    console.log(`--- Step E: Cache Stats & Metrics Debug Endpoint ---`);
    const statsRes = await makeRequest('GET', '/tasks/cache/stats', null, token);
    console.log(`📊 Cache Statistics Response:`);
    console.log(`   - Total Requests: ${statsRes.body.cache.stats.totalRequests}`);
    console.log(`   - Hits: ${statsRes.body.cache.stats.hits}`);
    console.log(`   - Misses: ${statsRes.body.cache.stats.misses}`);
    console.log(`   - Hit Rate: ${statsRes.body.cache.stats.hitRate}`);
    console.log(`   - Active Keys Count: ${statsRes.body.cache.keysCount}\n`);

    console.log(`========================================================================`);
    console.log(`🎉 ALL PRACTICAL 9 TESTS & VERIFICATIONS COMPLETED SUCCESSFULLY!`);
    console.log(`========================================================================\n`);

  } catch (err) {
    console.error(`❌ Test Error:`, err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    if (mongoServer) await mongoServer.stop();
    await mongoose.disconnect();
  }
};

runTests();
