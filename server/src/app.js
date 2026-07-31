require('dotenv').config({
  path: require('path').join(__dirname, '../.env'),
  quiet: true,
});
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');
const validateEnv = require('./config/validateEnv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const sanitizeRequest = require('./middleware/sanitizeMiddleware');

const app = express();
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
let envReady = false;

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
].filter(Boolean);

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: isProd ? undefined : false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      const isVercelPreview = typeof origin === 'string' && /\.vercel\.app$/i.test(origin);
      if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeRequest);

if (!isProd) {
  app.use(morgan('dev'));
}

const healthPayload = () => ({
  success: true,
  message: 'LuxeWatch API is running',
  service: 'luxewatch-api',
  env: process.env.NODE_ENV || 'development',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'pending',
  timestamp: new Date().toISOString(),
});

// Public probes — registered BEFORE DB gate so deploys stay monitorable
app.get('/', (req, res) => {
  res.status(200).json(healthPayload());
});

app.get('/health', (req, res) => {
  res.status(200).json(healthPayload());
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LuxeWatch API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      couriers: '/api/couriers',
      users: '/api/users',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json(healthPayload());
});

// Validate env + DB for application routes only
app.use(async (req, res, next) => {
  try {
    if (!envReady) {
      validateEnv();
      envReady = true;
    }
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/couriers', require('./routes/courierRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// 404 then central error handler (must stay last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
module.exports.default = app;
