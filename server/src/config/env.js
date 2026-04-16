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
  'http://localhost:5173',
  'http://127.0.0.1:5173'
);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://akshatsaxena4096_db_user:Akshataarav@cluster0.vxbbiuw.mongodb.net/?appName=Cluster0',
  jwtSecret: process.env.JWT_SECRET || '6a14ab16b8d5fb7d80ddb4e7bb364e479174f56f893b42c015cce13cde9752f585a286be5a9cd6ce80d94c68d7a024d9f20dc0b4115775f349dc0f19668639ca',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminRegisterSecret: process.env.ADMIN_REGISTER_SECRET || 'admin-secret',
  clientUrl: clientUrls[0] || 'http://localhost:5173',https://b-mobile.netlify.app ,
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

  if (!process.env.CLIENT_URLS && !process.env.CLIENT_URL) {
    missing.push('CLIENT_URLS');
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
