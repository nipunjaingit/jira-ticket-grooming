/**
 * Jira Service
 * Abstraction layer for Jira API interactions
 */

const axios = require('axios');
const logger = require('../utils/logger');
const constants = require('../config/constants');

/**
 * JiraService class
 * Handles all Jira API interactions
 */
class JiraService {
  constructor(auth) {
    this.auth = auth;
    this.client = this.createClient();
  }

  /**
   * Create Jira API client with authentication
   */
  createClient() {
    return axios.create({
      baseURL: process.env.JIRA_BASE_URL,
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get current authenticated user information
   */
  async getMyself() {
    try {
      logger.debug('Fetching current user information');
      const response = await this.client.get(constants.JIRA_ENDPOINTS.MYSELF);
      logger.info('Successfully fetched user information', { userId: response.data.accountId });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch user information', {
        message: error.message,
        status: error.response?.status,
      });
      throw {
        statusCode: error.response?.status || constants.HTTP_STATUS.SERVER_ERROR,
        message: constants.ERROR_MESSAGES.FAILED_JIRA_VALIDATION,
        data: error.response?.data,
      };
    }
  }

  /**
   * Get all projects accessible to the user
   */
  async getProjects() {
    try {
      logger.debug('Fetching projects');
      const response = await this.client.get(constants.JIRA_ENDPOINTS.PROJECTS);
      logger.info('Successfully fetched projects', { count: response.data.length });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch projects', {
        message: error.message,
        status: error.response?.status,
      });
      throw {
        statusCode: error.response?.status || constants.HTTP_STATUS.SERVER_ERROR,
        message: constants.ERROR_MESSAGES.FAILED_FETCH_PROJECTS,
        data: error.response?.data,
      };
    }
  }

  /**
   * Get issues with pagination support
   */
  async getIssues(projectId, options = {}) {
    try {
      const {
        maxResults = constants.DEFAULT_MAX_RESULTS,
        pageToken = null,
        jql = '',
      } = options;

      // Validate input
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Build JQL query
      let query = `project = ${projectId}`;
      if (jql) {
        query += ` AND ${jql}`;
      }
      query += ' ORDER BY created DESC';

      const params = {
        jql: query,
        maxResults: parseInt(maxResults),
        fields: constants.DEFAULT_FIELDS.join(','),
      };

      if (pageToken && pageToken !== '0') {
        params.nextPageToken = pageToken;
      }

      logger.debug('Fetching issues', { projectId, maxResults, hasPageToken: !!pageToken });
      const response = await this.client.get(constants.JIRA_ENDPOINTS.ISSUES, { params });

      const { issues = [], nextPageToken } = response.data;
      const isLast = !nextPageToken;

      logger.info('Successfully fetched issues', { count: issues.length, isLast });

      return {
        issues,
        nextPageToken,
        isLast,
      };
    } catch (error) {
      logger.error('Failed to fetch issues', {
        message: error.message,
        status: error.response?.status,
      });
      throw {
        statusCode: error.response?.status || constants.HTTP_STATUS.SERVER_ERROR,
        message: constants.ERROR_MESSAGES.FAILED_FETCH_ISSUES,
        data: error.response?.data,
      };
    }
  }

  /**
   * Get single issue details
   */
  async getIssueDetails(issueIdOrKey) {
    try {
      if (!issueIdOrKey) {
        throw new Error('Issue ID or key is required');
      }

      logger.debug('Fetching issue details', { issueId: issueIdOrKey });
      const endpoint = constants.JIRA_ENDPOINTS.ISSUE_DETAILS(issueIdOrKey);
      const response = await this.client.get(endpoint);

      logger.info('Successfully fetched issue details', { issueKey: response.data.key });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch issue details', {
        message: error.message,
        status: error.response?.status,
        issueId: issueIdOrKey,
      });
      throw {
        statusCode: error.response?.status || constants.HTTP_STATUS.SERVER_ERROR,
        message: constants.ERROR_MESSAGES.FAILED_FETCH_ISSUE,
        data: error.response?.data,
      };
    }
  }
}

module.exports = JiraService;
