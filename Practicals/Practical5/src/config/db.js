const mongoose = require('mongoose');

let mongoMemoryServer = null;

/**
 * Connect to MongoDB database.
 * Priority:
 * 1. process.env.MONGO_URI (if provided and reachable)
 * 2. Fallback to mongodb-memory-server for zero-config local testing and seamless evaluation
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      // Set connection timeout to 3 seconds for quick fallback check if local daemon is down
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB connected');
      console.log(`🍃 Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ Could not connect to primary MONGO_URI (${uri}): ${err.message}`);
      console.log(`🔄 Initializing fallback In-Memory MongoDB Server...`);
    }
  }

  // Fallback to mongodb-memory-server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log('MongoDB connected');
    console.log(`⚡ Connected to In-Memory MongoDB Server: ${memoryUri}`);
    return conn;
  } catch (err) {
    console.error(`🔥 Failed to connect to In-Memory MongoDB:`, err.message);
    throw err;
  }
};

/**
 * Disconnect MongoDB and cleanup memory server if active
 */
const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
