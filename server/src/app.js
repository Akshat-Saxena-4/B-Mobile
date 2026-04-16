import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import { getDatabaseStatus, isDatabaseConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
const allowedOrigins = new Set(env.clientUrls);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.nodeEnv === 'development' || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// Avoid 304 + empty JSON responses on API requests.
app.set('etag', false);
app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  })
);

if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'B-mobile backend is running',
    environment: env.nodeEnv,
    database: getDatabaseStatus(),
  });
});

app.get('/health', (req, res) => {
  const database = getDatabaseStatus();

  res.json({
    success: true,
    message: 'B-mobile API process is running',
    timestamp: new Date().toISOString(),
    database,
  });
});

app.get('/ready', (req, res) => {
  const database = getDatabaseStatus();
  const ready = database.connected;

  res.status(ready ? 200 : 503).json({
    success: ready,
    message: ready
      ? 'B-mobile API is ready to serve requests'
      : 'B-mobile API is waiting for the database connection',
    timestamp: new Date().toISOString(),
    database,
  });
});

app.use('/api/v1', (req, res, next) => {
  if (isDatabaseConnected()) {
    return next();
  }

  res.status(503).json({
    success: false,
    message: 'Database is not connected yet. Please try again shortly.',
    database: getDatabaseStatus(),
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
