/**
 * Input Validators
 * Utility functions for validating request data
 */

/**
 * Validate Jira authentication header
 */
const validateJiraAuth = (auth) => {
  if (!auth || typeof auth !== 'string') {
    return {
      valid: false,
      error: 'Invalid or missing authentication header',
    };
  }
  return { valid: true };
};

/**
 * Validate ticket data for analysis
 */
const validateTicketData = (ticket) => {
  if (!ticket || typeof ticket !== 'object') {
    return {
      valid: false,
      error: 'Ticket must be a valid object',
    };
  }

  if (!ticket.fields || typeof ticket.fields !== 'object') {
    return {
      valid: false,
      error: 'Ticket must have fields property',
    };
  }

  if (!ticket.fields.summary || typeof ticket.fields.summary !== 'string') {
    return {
      valid: false,
      error: 'Ticket must have a summary',
    };
  }

  return { valid: true };
};

/**
 * Validate LLM API key
 */
const validateLLMApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return {
      valid: false,
      error: 'LLM API key is required and must be a string',
    };
  }
  return { valid: true };
};

/**
 * Validate project ID
 */
const validateProjectId = (projectId) => {
  if (!projectId || (typeof projectId !== 'string' && typeof projectId !== 'number')) {
    return {
      valid: false,
      error: 'Project ID is required and must be a string or number',
    };
  }
  return { valid: true };
};

/**
 * Validate issue ID or key
 */
const validateIssueId = (issueId) => {
  if (!issueId || typeof issueId !== 'string') {
    return {
      valid: false,
      error: 'Issue ID or key is required and must be a string',
    };
  }
  return { valid: true };
};

/**
 * Validate query parameters for pagination
 */
const validatePaginationParams = (maxResults = 50, startAt = undefined) => {
  const max = parseInt(maxResults);
  if (isNaN(max) || max < 1 || max > 100) {
    return {
      valid: false,
      error: 'maxResults must be a number between 1 and 100',
    };
  }

  if (startAt && typeof startAt !== 'string') {
    return {
      valid: false,
      error: 'startAt must be a string (nextPageToken)',
    };
  }

  return { valid: true };
};

module.exports = {
  validateJiraAuth,
  validateTicketData,
  validateLLMApiKey,
  validateProjectId,
  validateIssueId,
  validatePaginationParams,
};
