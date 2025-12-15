/**
 * Routes Aggregator
 * Combines all route modules into a single router
 */

const express = require('express');
const jiraRoutes = require('./jira');
const analysisRoutes = require('./analysis');

const router = express.Router();

/**
 * Mount route modules
 */
router.use('/jira', jiraRoutes);
router.use('/analysis', analysisRoutes);

module.exports = router;
