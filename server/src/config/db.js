import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

const redactMongoUri = (uri = '') =>
  uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:<redacted>@');

const connectDB = async () => {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    throw new Error(
      [
        `MongoDB connection failed for ${redactMongoUri(env.mongoUri)}.`,
        `Original error: ${error.message}.`,
        'Check that Render has the correct MONGODB_URI, your MongoDB Atlas Network Access allows Render, and the database user credentials are valid.',
      ].join(' ')
    );
  }
};

export default connectDB;

