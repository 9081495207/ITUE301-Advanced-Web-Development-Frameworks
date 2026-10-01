const mongoose = require('mongoose');

let mongoMemoryServer = null;

/**
 * Connect to MongoDB database (Primary MONGO_URI or Fallback In-Memory Server)
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(`🍃 Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ Could not connect to MONGO_URI (${uri}): ${err.message}`);
      console.log(`🔄 Initializing fallback In-Memory MongoDB Server...`);
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`⚡ Connected to In-Memory MongoDB Server: ${memoryUri}`);
    return conn;
  } catch (err) {
    console.error(`🔥 Failed to connect to MongoDB:`, err.message);
    throw err;
  }
};

/**
 * Disconnect from MongoDB database
 */
const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
