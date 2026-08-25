const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const hasUri = !!process.env.MONGO_URI;
    console.log(`[DB] MONGO_URI present: ${hasUri}, scheme: ${hasUri ? process.env.MONGO_URI.split('://')[0] : 'n/a'}`);

    console.time('[DB] connect');
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.timeEnd('[DB] connect');
        console.log(`[DB] connected to ${m.connection.host}, state: ${m.connection.readyState}`);
        return m;
      })
      .catch((err) => {
        console.timeEnd('[DB] connect');
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

const disconnectDB = async () => {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('[DB] MongoDB disconnected');
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
