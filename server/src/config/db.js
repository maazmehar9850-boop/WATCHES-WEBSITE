const mongoose = require('mongoose');
const dns = require('dns');

// Windows often breaks Node's SRV lookup for mongodb+srv; public DNS fixes it
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  /* ignore */
}

let cached = global.__lw_mongoose;
if (!cached) {
  cached = global.__lw_mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 20000,
        family: 4,
      })
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      })
      .catch((error) => {
        cached.promise = null;
        cached.conn = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    // Never kill the process — keep API up for /health; requests get 500 via error handler
    throw error;
  }
};

module.exports = connectDB;
