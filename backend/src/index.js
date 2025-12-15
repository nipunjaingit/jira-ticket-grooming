/**
 * Application Entry Point
 * Initializes Express server and mounts all middleware and routes
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const constants = require('./config/constants');
const logger = require('./utils/logger');
const { cacheControl } = require('./middleware/cache');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

// Initialize Express app
const app = express();
const PORT = constants.PORT;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cacheControl);

// Routes
app.use('/api', routes);

// Global error handler (must be last)
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${constants.NODE_ENV}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { message: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});
