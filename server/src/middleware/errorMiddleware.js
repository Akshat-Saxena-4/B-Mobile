export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const payload = {
    success: false,
    message: error.message || 'Internal server error',
  };

  if (process.env.NODE_ENV !== 'production' && error.stack) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
};

