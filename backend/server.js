const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const connectDB = require('./config/db');
const { sanitizeDbError } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const addressRoutes = require('./routes/addressRoutes');
const adminRoutes = require('./routes/adminRoutes');
const imageRoutes = require('./routes/imageRoutes');

const app = express();

app.set('trust proxy', 1);

const dbWarmup = connectDB();
dbWarmup.catch(() => {});

app.use('/api/payments/webhook/razorpay', express.raw({ type: 'application/json' }));

const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(compression());
if (!isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5177',
  'http://127.0.0.1:5177',
  'https://fashion-fusion-prod-r5id.vercel.app',
  'https://fashion-fusion-frontend-prod.vercel.app',
  'https://fashionsfusion.co.in',
  'https://www.fashionsfusion.co.in',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  skip: (req) => req.originalUrl.startsWith('/api/images/'),
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  if (req.path === '/api/payments/razorpay/verify' || req.path === '/api/payments/webhook/razorpay') {
    return next();
  }
  const start = Date.now();
  try {
    await connectDB();
    const elapsed = Date.now() - start;
    if (elapsed > 500) {
      console.log(`[DB] middleware waited ${elapsed}ms for connection`);
    }
    next();
  } catch (error) {
    console.error(`[DB] Request rejected - MongoDB unavailable: ${sanitizeDbError(error)}`);
    res.status(503).json({ message: 'Database is temporarily unavailable. Please try again.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    mongoose.disconnect()
      .then(() => {
        console.log('MongoDB disconnected');
        process.exit(0);
      })
      .catch(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
  });

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;
