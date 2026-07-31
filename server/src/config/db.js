const mongoose = require('mongoose');
const dns = require('dns');

// Windows often breaks Node's SRV lookup for mongodb+srv; public DNS fixes it
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  /* ignore */
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
      family: 4, // prefer IPv4 (avoids common Windows Atlas SRV/IPv6 failures)
    });
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
