const { sanitizeDbError } = require('../config/db');

const SAFE_MESSAGES = {
  400: 'Bad request',
  401: 'Not authorized',
  403: 'Forbidden',
  404: 'Resource not found',
  409: 'Conflict',
  413: 'Request payload too large',
  429: 'Too many requests',
};

const logError = (req, statusCode, err) => {
  const detail = sanitizeDbError(err.message);
  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${statusCode}: ${detail}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isProd = process.env.NODE_ENV === 'production';

  const resCode = Number(res.statusCode);
  const initial =
    resCode && resCode !== 200 ? resCode : err.statusCode || err.status || 500;
  let statusCode = Number.isInteger(initial) && initial >= 400 && initial <= 599 ? initial : 500;

  let message;

  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = SAFE_MESSAGES[413];
  } else if (err.message && err.message.includes('not allowed by CORS')) {
    statusCode = 403;
    message = SAFE_MESSAGES[403];
  } else if (err.name === 'MulterError') {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : 'Upload failed';
  } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = SAFE_MESSAGES[404];
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(', ');
  } else if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    statusCode = 500;
    message = isProd ? 'Internal server error' : err.message;
  }

  logError(req, statusCode, err);

  res.status(statusCode).json({ message });
};

const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound, safeMessages: SAFE_MESSAGES };