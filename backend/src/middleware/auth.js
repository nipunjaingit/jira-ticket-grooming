/**
 * Authentication Middleware
 * Validates Jira authentication headers
 */

const constants = require('../config/constants');
const logger = require('../utils/logger');
const validators = require('../utils/validators');

/**
 * Middleware to check for Jira Auth header
 */
const requireJiraAuth = (req, res, next) => {
  const auth = req.headers['x-encoded-auth'];

  const validation = validators.validateJiraAuth(auth);
  if (!validation.valid) {
    logger.warn('Missing or invalid Jira authentication', { ip: req.ip });
    return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json({
      error: constants.ERROR_MESSAGES.MISSING_AUTH,
    });
  }

  req.jiraAuth = auth;
  logger.debug('Jira authentication validated');
  next();
};

module.exports = {
  requireJiraAuth,
};
