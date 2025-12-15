/**
 * Analysis Routes
 * Routes for analysis endpoints
 */

const express = require('express');
const { handleAnalyzeTicket } = require('../controllers/analysisController');

const router = express.Router();

/**
 * POST /api/analysis
 * Analyze a ticket using AI
 * Body: { ticket, llmApiKey }
 */
router.post('/', handleAnalyzeTicket);

module.exports = router;
