import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/premium-commerce',
  jwtSecret: process.env.JWT_SECRET || 'replace-with-a-strong-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminRegisterSecret: process.env.ADMIN_REGISTER_SECRET || 'admin-secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

export default env;

