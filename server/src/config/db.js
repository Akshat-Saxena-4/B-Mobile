import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  logger.info(`MongoDB connected: ${mongoose.connection.host}`);
};

export default connectDB;

