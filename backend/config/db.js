const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let listenersRegistered = false;

const CONNECTION_STRING_PATTERN = /mongodb(\+srv)?:\/\/[^\s'"`]+/gi;

const sanitizeDbError = (error) => {
  if (!error) return 'unknown database error';
  const message = error.message
    ? String(error.message).replace(CONNECTION_STRING_PATTERN, '[REDACTED_CONNECTION_STRING]')
    : '';
  const code = error.code !== undefined ? `code=${error.code}` : 'code=n/a';
  const name = error.name || 'UnknownError';
  const subCode = error.result && error.result.code ? ` subCode=${error.result.code}` : '';
  return `[DB] error => name=${name} ${code}${subCode} readyState=${mongoose.connection.readyState} message=${message}`;
};

const resetConnectionCache = () => {
  cached = global.mongoose = { conn: null, promise: null };
};

const registerConnectionListeners = () => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('error', (err) => {
    console.error(sanitizeDbError(err));
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected - connection cache will refresh on next request');
    resetConnectionCache();
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[DB] MongoDB reconnected');
  });

  mongoose.connection.on('close', () => {
    console.warn('[DB] MongoDB connection closed - connection cache will refresh on next request');
    resetConnectionCache();
  });
};

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    const hasUri = !!uri;
    console.log(`[DB] MONGO_URI present: ${hasUri}, scheme: ${hasUri ? uri.split('://')[0] : 'n/a'}`);

    registerConnectionListeners();

    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      })
      .then((m) => {
        const state = m.connection.readyState;
        if (state !== 1) {
          throw new Error(`Connected but readyState=${state}, requested connections will be retried`);
        }
        console.log(`[DB] connected to ${m.connection.host}, state: ${state}`);
        return m;
      });

    cached.promise = cached.promise.catch((err) => {
      cached.promise = null;
      console.error(sanitizeDbError(err));
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    resetConnectionCache();
    console.log('[DB] MongoDB disconnected');
  } else {
    resetConnectionCache();
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
module.exports.sanitizeDbError = sanitizeDbError;