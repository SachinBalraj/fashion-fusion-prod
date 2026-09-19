const mongoose = require('mongoose');

const BUCKET_NAME = 'productImages';
const CHUNK_SIZE = 255 * 1024;

const getGridFS = () => {
  const conn = mongoose.connection;
  if (!conn || conn.readyState !== 1 || !conn.db) {
    const error = new Error('Database is temporarily unavailable. Please try again.');
    error.statusCode = 503;
    throw error;
  }
  return new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: BUCKET_NAME,
    chunkSizeBytes: CHUNK_SIZE,
  });
};

module.exports = { getGridFS, BUCKET_NAME };