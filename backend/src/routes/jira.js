/**
 * Jira Routes
 * Routes for Jira API endpoints
 */

const express = require('express');
const {
  handleGetMyself,
  handleGetProjects,
  handleGetIssues,
  handleGetIssueDetails,
} = require('../controllers/jiraController');
const { requireJiraAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/jira/myself
 * Validate Jira credentials
 */
router.get('/myself', requireJiraAuth, handleGetMyself);

/**
 * GET /api/jira/projects
 * Fetch all projects
 */
router.get('/projects', requireJiraAuth, handleGetProjects);

/**
 * GET /api/jira/issues
 * Fetch issues for a project
 * Query params: projectId, startAt (optional), maxResults (optional), jql (optional)
 */
router.get('/issues', requireJiraAuth, handleGetIssues);

/**
 * GET /api/jira/issue/:id
 * Fetch single issue details
 */
router.get('/issue/:id', requireJiraAuth, handleGetIssueDetails);

module.exports = router;
