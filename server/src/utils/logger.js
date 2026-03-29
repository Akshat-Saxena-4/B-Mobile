const log = (level, message) => {
  const timestamp = new Date().toISOString();
  // Logging is intentionally minimal and stdout-friendly for cloud runtimes.
  console[level](`[${timestamp}] ${message}`);
};

const logger = {
  info: (message) => log('log', message),
  warn: (message) => log('warn', message),
  error: (message) => log('error', message),
};

export default logger;

