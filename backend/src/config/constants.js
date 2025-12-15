/**
 * Application Configuration Constants
 * Centralized configuration for the application
 */

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Jira Configuration
  JIRA_BASE_URL: process.env.JIRA_BASE_URL || 'https://your-instance.atlassian.net',

  // API Configuration
  API_PREFIX: '/api',
  JIRA_API_VERSION: 'v3',
  JIRA_API_BASE: '/rest/api/3',

  // Jira API Endpoints
  JIRA_ENDPOINTS: {
    MYSELF: '/rest/api/3/myself',
    PROJECTS: '/rest/api/3/project',
    ISSUES: '/rest/api/3/search/jql',
    ISSUE_DETAILS: (id) => `/rest/api/3/issue/${id}`,
  },

  // Issue Search Configuration
  DEFAULT_MAX_RESULTS: 50,
  DEFAULT_FIELDS: ['summary', 'status', 'assignee', 'created', 'priority', 'issuetype'],

  // LLM Configuration
  LLM_DEFAULT_TEMPERATURE: 0.0,
  LLM_DEFAULT_MODEL_GEMINI: 'gemini-2.5-flash-lite',
  LLM_DEFAULT_MODEL_OPENAI: 'gpt-4o-mini',
  LLM_DEFAULT_MODEL_MISTRAL: 'mistral-large-latest',

  // Cache Configuration
  CACHE_CONTROL_HEADERS: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
  },

  // Error Messages
  ERROR_MESSAGES: {
    MISSING_AUTH: 'Missing x-encoded-auth header',
    INVALID_REQUEST: 'Invalid request data',
    FAILED_JIRA_VALIDATION: 'Failed to validate Jira credentials',
    FAILED_FETCH_PROJECTS: 'Failed to fetch Jira projects',
    FAILED_FETCH_ISSUES: 'Failed to fetch Jira issues',
    FAILED_FETCH_ISSUE: 'Failed to fetch Jira issue details',
    MISSING_TICKET_DATA: 'Ticket data is required for analysis',
    ANALYSIS_FAILED: 'Failed to analyze ticket',
    LLM_KEY_REQUIRED: 'LLM API key is required',
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Logging Configuration
  LOG_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
  },

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
