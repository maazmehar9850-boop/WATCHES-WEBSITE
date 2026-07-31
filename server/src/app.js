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
const validateEnv = require('./config/validateEnv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const sanitizeRequest = require('./middleware/sanitizeMiddleware');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
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

// Validate env + DB on first request (not at import) so Vercel can build the function
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

if (!isProd) {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'LuxeWatch API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/couriers', require('./routes/courierRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.use(notFound);
app.use(errorHandler);

// Vercel Node expects a default export; CommonJS module.exports covers both.
module.exports = app;
module.exports.default = app;
