const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const http = require('http');
const app = require('../server');
const { flushCache, resetCacheMetrics } = require('../src/config/cache');

// Fallback runner for running directly with `node test/api.test.js` outside of Jest
if (typeof describe === 'undefined') {
  const tests = [];
  let beforeAllFn, afterAllFn;
  global.describe = (name, fn) => {
    setTimeout(async () => {
      try {
        if (beforeAllFn) await beforeAllFn();
        for (const t of tests) {
          console.log(`Running test: ${t.name}`);
          await t.fn();
        }
      } catch (err) {
        console.error("Test failed:", err);
        process.exitCode = 1;
      } finally {
        if (afterAllFn) await afterAllFn();
      }
    }, 0);
    fn();
  };
  global.beforeAll = (fn) => { beforeAllFn = fn; };
  global.afterAll = (fn) => { afterAllFn = fn; };
  global.test = (name, fn) => { tests.push({ name, fn }); };
  global.expect = (actual) => ({
    toBe: (expected) => {
      if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
    },
    toBeDefined: () => {
      if (actual === undefined) throw new Error(`Expected defined value, got undefined`);
    }
  });
}

let mongoServer;
let server;
let baseUrl;
let token;
let sampleTaskId;
let createdTaskId;

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

describe('Practical 9: In-Memory Caching & Performance Test Suite', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    flushCache();
    resetCacheMetrics();
  }, 30000);

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    await mongoose.disconnect();
  });

  test('Step A: Register User & Obtain JWT Token', async () => {
    const regRes = await makeRequest('POST', '/auth/register', {
      name: 'Caching Tester',
      email: 'caching.tester@example.com',
      password: 'password123'
    });

    expect(regRes.statusCode).toBe(201);
    expect(regRes.body.token).toBeDefined();
    token = regRes.body.token;
  });

  test('Step B: Seed Database with 25 Tasks', async () => {
    expect(token).toBeDefined();
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
      expect(taskRes.statusCode).toBe(201);
      if (i === 1) sampleTaskId = taskRes.body.data._id;
    }
    expect(sampleTaskId).toBeDefined();

    flushCache();
    resetCacheMetrics();
  });

  test('Step C: Measure Cached vs Uncached GET /tasks Performance', async () => {
    const cachedReadings = [];
    const uncachedReadings = [];

    for (let i = 1; i <= 3; i++) {
      const res = await makeRequest('GET', '/tasks', null, token);
      expect(res.statusCode).toBe(200);
      const cacheHeader = res.headers['x-cache'] || 'N/A';
      cachedReadings.push({
        request: `Request #${i}`,
        timeMs: res.responseTimeMs.toFixed(2),
        status: cacheHeader,
        itemsCount: res.body.count
      });
    }

    for (let i = 1; i <= 3; i++) {
      const res = await makeRequest('GET', '/tasks?bypassCache=true', null, token);
      expect(res.statusCode).toBe(200);
      const cacheHeader = res.headers['x-cache'] || 'N/A';
      uncachedReadings.push({
        request: `Request #${i}`,
        timeMs: res.responseTimeMs.toFixed(2),
        status: cacheHeader,
        itemsCount: res.body.count
      });
    }

    console.log(`\n========================================================================`);
    console.log(`📋 LAB JOURNAL RESULTS TABLE`);
    console.log(`========================================================================`);
    console.log(`+-----------+-----------------------+-------------------------+---------------+`);
    console.log(`| Request   | Cached Time (ms)      | Uncached Time (ms)      | Performance   |`);
    console.log(`+-----------+-----------------------+-------------------------+---------------+`);

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

    console.log(`+-----------+-----------------------+-------------------------+---------------+`);
    console.log(`| AVERAGE   | ${avgCached.padEnd(7)} ms           | ${avgUncached.padEnd(7)} ms           | ${overallSpeedup}% faster   |`);
    console.log(`+-----------+-----------------------+-------------------------+---------------+|\n`);
  });

  test('Step D: Verify Cache Invalidation on Write Operations (POST, PUT, DELETE)', async () => {
    await makeRequest('GET', '/tasks', null, token);
    const checkCacheBefore = await makeRequest('GET', '/tasks', null, token);
    expect(checkCacheBefore.headers['x-cache']).toBe('HIT');

    const postRes = await makeRequest(
      'POST',
      '/tasks',
      { title: 'Invalidation Trigger Task', description: 'Triggers cache del' },
      token
    );
    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.cacheInvalidated).toBe(true);
    createdTaskId = postRes.body.data._id;

    const checkCacheAfterPOST = await makeRequest('GET', '/tasks', null, token);
    expect(checkCacheAfterPOST.headers['x-cache']).toBe('MISS');

    const putRes = await makeRequest(
      'PUT',
      `/tasks/${sampleTaskId}`,
      { title: 'Updated Benchmark Task #1' },
      token
    );
    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.cacheInvalidated).toBe(true);

    const checkCacheAfterPUT = await makeRequest('GET', '/tasks', null, token);
    expect(checkCacheAfterPUT.headers['x-cache']).toBe('MISS');

    const delRes = await makeRequest('DELETE', `/tasks/${sampleTaskId}`, null, token);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.cacheInvalidated).toBe(true);

    const checkCacheAfterDEL = await makeRequest('GET', '/tasks', null, token);
    expect(checkCacheAfterDEL.headers['x-cache']).toBe('MISS');
  });

  test('Step E: Single-Task Caching (GET /tasks/:id)', async () => {
    expect(createdTaskId).toBeDefined();
    const single1 = await makeRequest('GET', `/tasks/${createdTaskId}`, null, token);
    expect(single1.statusCode).toBe(200);
    expect(single1.headers['x-cache']).toBe('MISS');

    const single2 = await makeRequest('GET', `/tasks/${createdTaskId}`, null, token);
    expect(single2.statusCode).toBe(200);
    expect(single2.headers['x-cache']).toBe('HIT');
  });

  test('Step F: Debug Cache Stats Endpoint (GET /tasks/cache/stats)', async () => {
    const statsRes = await makeRequest('GET', '/tasks/cache/stats', null, token);
    expect(statsRes.statusCode).toBe(200);
    expect(statsRes.body.cache).toBeDefined();
    expect(statsRes.body.cache.stats).toBeDefined();
  });
});
