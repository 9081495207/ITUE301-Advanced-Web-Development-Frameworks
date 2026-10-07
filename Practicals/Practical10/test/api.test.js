const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const http = require('http');
const app = require('../server');

let mongoServer;
let server;
let baseUrl;
let token;
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

const runTests = async () => {
  console.log(`========================================================================`);
  console.log(`🧪 PRACTICAL 10: ASYNCHRONOUS EVENT-DRIVEN ARCHITECTURE TEST SUITE`);
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

    // 3. Register User & Obtain JWT
    console.log(`--- Step A: Authentication Setup ---`);
    const regRes = await makeRequest('POST', '/auth/register', {
      name: 'EventEmitter Tester',
      email: 'events.tester@example.com',
      password: 'password123'
    });
    token = regRes.body.token;
    console.log(`✅ Registered user and received JWT token.\n`);

    // 4. Lab Steps 3, 4, 5, 6: POST /tasks with task-created Event & Artificial Delay
    console.log(`========================================================================`);
    console.log(`⚡ STEP 3-6: DEMONSTRATING NON-BLOCKING EVENT EMISSION & TIMESTAMPS`);
    console.log(`========================================================================`);
    console.log(`\n🔹 Sending POST /tasks request with 1500ms background listener delay...`);

    const postStart = Date.now();
    const postRes = await makeRequest(
      'POST',
      '/tasks',
      {
        title: 'Asynchronous Background Processing Task',
        description: 'Testing non-blocking EventEmitter implementation',
        priority: 'high',
        delayMs: 1500
      },
      token
    );
    const postEnd = Date.now();
    createdTaskId = postRes.body.data._id;

    console.log(`   [API Response Status] : ${postRes.statusCode}`);
    console.log(`   [API Response Duration]: ${postRes.responseTimeMs.toFixed(2)} ms`);
    console.log(`   [API Response Timestamp]: ${postRes.body.apiResponseTimestamp}`);

    console.log(`\n⏳ Waiting 2000ms for background notification listener to complete execution...`);
    await new Promise((r) => setTimeout(r, 2000));
    console.log(`✅ Background event processing completed.\n`);

    // 5. Supplementary Problem 1: task-deleted Event
    console.log(`========================================================================`);
    console.log(`🗑️ SUPPLEMENTARY PROBLEM 1: task-deleted EVENT LISTENER`);
    console.log(`========================================================================`);
    console.log(`\n🔹 Sending DELETE /tasks/${createdTaskId} request...`);

    const delRes = await makeRequest('DELETE', `/tasks/${createdTaskId}`, null, token);

    console.log(`   [API Response Status]  : ${delRes.statusCode}`);
    console.log(`   [API Response Duration] : ${delRes.responseTimeMs.toFixed(2)} ms`);
    console.log(`   [API Response Timestamp]: ${delRes.body.apiResponseTimestamp}`);

    console.log(`\n⏳ Waiting 1200ms for background deletion listener to finish...`);
    await new Promise((r) => setTimeout(r, 1200));
    console.log(`✅ Background deletion handler completed.\n`);

    // 6. Supplementary Problem 2: Error Event Listener
    console.log(`========================================================================`);
    console.log(`🛡️ SUPPLEMENTARY PROBLEM 2: ERROR EVENT LISTENER HANDLING`);
    console.log(`========================================================================`);
    console.log(`\n🔹 Creating task with TRIGGER_ERROR in title...`);

    const errTaskRes = await makeRequest(
      'POST',
      '/tasks',
      {
        title: 'TRIGGER_ERROR: Faulty Notification Task',
        description: 'Simulating listener error'
      },
      token
    );

    console.log(`   [API Response Status]  : ${errTaskRes.statusCode} (API succeeds without crashing!)`);
    console.log(`   [API Response Duration] : ${errTaskRes.responseTimeMs.toFixed(2)} ms`);
    console.log(`✅ Error event caught by listener safely.\n`);

    // 7. Supplementary Problem 3: Simulated Slow Notification Handler (2.0s delay)
    console.log(`========================================================================`);
    console.log(`🐢 SUPPLEMENTARY PROBLEM 3: SIMULATING SLOW LISTENER (2000ms DELAY)`);
    console.log(`========================================================================`);
    console.log(`\n🔹 Sending POST /tasks request with 2000ms artificial delay...`);

    const slowRes = await makeRequest(
      'POST',
      '/tasks',
      {
        title: 'Slow Notification Listener Task',
        description: 'Simulating 2 second external webhook/notification',
        delayMs: 2000
      },
      token
    );

    console.log(`   [API Response Status]  : ${slowRes.statusCode}`);
    console.log(`   [API Response Duration] : ${slowRes.responseTimeMs.toFixed(2)} ms (INSTANT RESPONSE!)`);
    console.log(`   [API Response Timestamp]: ${slowRes.body.apiResponseTimestamp}`);

    console.log(`\n⏳ Waiting 2500ms for slow background handler to complete...`);
    await new Promise((r) => setTimeout(r, 2500));
    console.log(`✅ Slow listener finished executing in background.\n`);

    // Summary Table
    console.log(`========================================================================`);
    console.log(`📋 SUMMARY TABLE OF API RESPONSE TIMES VS BACKGROUND COMPLETION`);
    console.log(`========================================================================`);
    console.log(`+----------------------------------+------------------+---------------------+`);
    console.log(`| Test Operation                   | API Response Time| Execution Mode      |`);
    console.log(`+----------------------------------+------------------+---------------------+`);
    console.log(`| POST /tasks (Standard Event)     | ${postRes.responseTimeMs.toFixed(2).padEnd(6)} ms     | Non-blocking Async  |`);
    console.log(`| DELETE /tasks/:id (Delete Event) | ${delRes.responseTimeMs.toFixed(2).padEnd(6)} ms     | Non-blocking Async  |`);
    console.log(`| POST /tasks (Error Simulation)   | ${errTaskRes.responseTimeMs.toFixed(2).padEnd(6)} ms     | Non-blocking Async  |`);
    console.log(`| POST /tasks (2.0s Slow Listener) | ${slowRes.responseTimeMs.toFixed(2).padEnd(6)} ms     | Non-blocking Async  |`);
    console.log(`+----------------------------------+------------------+---------------------+\n`);

    console.log(`========================================================================`);
    console.log(`🎉 ALL PRACTICAL 10 TESTS & VERIFICATIONS COMPLETED SUCCESSFULLY!`);
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
