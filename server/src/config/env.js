import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const parseOriginList = (...values) =>
  [...new Set(
    values
      .flatMap((value) => String(value || '').split(','))
      .map((value) => value.trim())
      .filter(Boolean)
  )];

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  return ['true', '1', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const clientUrls = parseOriginList(
  process.env.CLIENT_URLS,
  process.env.CLIENT_URL,
  'https://b-mobile.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/premium-commerce',
  jwtSecret: process.env.JWT_SECRET || 'replace-with-a-strong-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminRegisterSecret: process.env.ADMIN_REGISTER_SECRET || 'admin-secret',
  adminLoginEmail: String(process.env.ADMIN_LOGIN_EMAIL || '').trim().toLowerCase(),
  adminLoginPassword: String(process.env.ADMIN_LOGIN_PASSWORD || '').trim(),
  clientUrl: clientUrls[0] || 'http://localhost:5173',
  clientUrls,
  seedDemoCatalogOnStart: parseBoolean(process.env.SEED_DEMO_CATALOG_ON_START),
};

if (env.nodeEnv === 'production') {
  const missing = [];

  if (!process.env.MONGODB_URI) {
    missing.push('MONGODB_URI');
  }

  if (!process.env.JWT_SECRET) {
    missing.push('JWT_SECRET');
  }

  if (!process.env.ADMIN_REGISTER_SECRET) {
    missing.push('ADMIN_REGISTER_SECRET');
  }

  if (missing.length) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(
        ', '
      )}. Render deployments need these values before the server can boot.`
    );
  }
}

export default env;
