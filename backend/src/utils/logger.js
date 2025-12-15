/**
 * Logger Utility
 * Centralized logging with timestamps and levels
 */

const constants = require('../config/constants');

const LOG_COLORS = {
  error: '\x1b[31m',    // Red
  warn: '\x1b[33m',     // Yellow
  info: '\x1b[36m',     // Cyan
  debug: '\x1b[35m',    // Magenta
  reset: '\x1b[0m',     // Reset
};

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const color = LOG_COLORS[level] || '';
  const reset = LOG_COLORS.reset;
  
  let output = `${color}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}`;
  
  if (data) {
    output += `\n${JSON.stringify(data, null, 2)}`;
  }
  
  return output;
};

/**
 * Check if logging is enabled for this level
 */
const isLogLevelEnabled = (level) => {
  const levels = ['error', 'warn', 'info', 'debug'];
  const currentLevelIndex = levels.indexOf(constants.LOG_LEVEL);
  const requestedLevelIndex = levels.indexOf(level);
  
  return requestedLevelIndex <= currentLevelIndex;
};

module.exports = {
  error: (message, data = null) => {
    if (isLogLevelEnabled('error')) {
      console.error(formatMessage('error', message, data));
    }
  },

  warn: (message, data = null) => {
    if (isLogLevelEnabled('warn')) {
      console.warn(formatMessage('warn', message, data));
    }
  },

  info: (message, data = null) => {
    if (isLogLevelEnabled('info')) {
      console.log(formatMessage('info', message, data));
    }
  },

  debug: (message, data = null) => {
    if (isLogLevelEnabled('debug')) {
      console.log(formatMessage('debug', message, data));
    }
  },
};
