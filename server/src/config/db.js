import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

const READY_STATE_LABELS = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

let lastConnectionError = null;
let listenersBound = false;

const redactMongoUri = (uri = '') =>
  uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:<redacted>@');

const bindConnectionListeners = () => {
  if (listenersBound) {
    return;
  }

  listenersBound = true;

  mongoose.connection.on('connected', () => {
    lastConnectionError = null;
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (error) => {
    lastConnectionError = error;
    logger.error(`MongoDB error: ${error.message}`);
  });
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const getDatabaseStatus = () => ({
  connected: isDatabaseConnected(),
  state: READY_STATE_LABELS[mongoose.connection.readyState] || 'unknown',
  host: mongoose.connection.host || '',
  lastError: lastConnectionError?.message || null,
});

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);
  bindConnectionListeners();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    lastConnectionError = null;
    return mongoose.connection;
  } catch (error) {
    lastConnectionError = error;
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
