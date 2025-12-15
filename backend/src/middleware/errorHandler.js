/**
 * Global Error Handler Middleware
 * Catches and formats all application errors
 */

const logger = require('../utils/logger');
const constants = require('../config/constants');

/**
 * Global error handling middleware
 * Should be added last, after all other middleware and routes
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Determine status code
  let statusCode = err.statusCode || err.status || constants.HTTP_STATUS.SERVER_ERROR;
  if (statusCode < 100 || statusCode > 599) {
    statusCode = constants.HTTP_STATUS.SERVER_ERROR;
  }

  // Determine error message
  let message = err.message || 'Internal server error';
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};
