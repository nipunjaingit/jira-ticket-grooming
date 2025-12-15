/**
 * Cache Control Middleware
 * Prevents caching of API responses
 */

const constants = require('../config/constants');

/**
 * Middleware to prevent response caching
 */
const cacheControl = (req, res, next) => {
  Object.entries(constants.CACHE_CONTROL_HEADERS).forEach(([key, value]) => {
    res.set(key, value);
  });
  next();
};

module.exports = {
  cacheControl,
};
