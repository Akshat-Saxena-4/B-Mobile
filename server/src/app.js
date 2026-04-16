import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

/* Avoid 304 + empty body on API JSON — axios rejects non-2xx, so clients would keep an empty catalog. */
app.set('etag', false);

app.use(
  cors({
    origin:
      env.nodeEnv === 'development'
        ? true
        : env.clientUrl,
    credentials: true,
  })
);
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

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'B-mobile API is healthy',
    timestamp: new Date().toISOString(),
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

