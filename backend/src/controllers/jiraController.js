/**
 * Jira Controller
 * HTTP request handlers for Jira-related endpoints
 */

const JiraService = require('../services/jiraService');
const logger = require('../utils/logger');
const constants = require('../config/constants');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Handle GET /api/jira/myself
 * Validates user credentials by fetching user info
 */
const handleGetMyself = asyncHandler(async (req, res) => {
  const jiraService = new JiraService(req.jiraAuth);
  const user = await jiraService.getMyself();

  res.json(user);
});

/**
 * Handle GET /api/jira/projects
 * Fetches all projects accessible to the user
 */
const handleGetProjects = asyncHandler(async (req, res) => {
  const jiraService = new JiraService(req.jiraAuth);
  const projects = await jiraService.getProjects();

  res.json(projects);
});

/**
 * Handle GET /api/jira/issues
 * Fetches issues for a project with pagination support
 */
const handleGetIssues = asyncHandler(async (req, res) => {
  const { projectId, startAt, maxResults, jql } = req.query;

  if (!projectId) {
    logger.warn('Missing projectId parameter');
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
      error: 'projectId is required',
    });
  }

  const jiraService = new JiraService(req.jiraAuth);
  const result = await jiraService.getIssues(projectId, {
    maxResults: maxResults || constants.DEFAULT_MAX_RESULTS,
    pageToken: startAt,
    jql: jql || '',
  });

  res.json(result);
});

/**
 * Handle GET /api/jira/issue/:id
 * Fetches single issue details
 */
const handleGetIssueDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.warn('Missing issue ID parameter');
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
      error: 'Issue ID is required',
    });
  }

  const jiraService = new JiraService(req.jiraAuth);
  const issue = await jiraService.getIssueDetails(id);

  res.json(issue);
});

module.exports = {
  handleGetMyself,
  handleGetProjects,
  handleGetIssues,
  handleGetIssueDetails,
};
