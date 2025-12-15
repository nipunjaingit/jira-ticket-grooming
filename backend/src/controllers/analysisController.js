/**
 * Analysis Controller
 * HTTP request handlers for analysis-related endpoints
 */

const AnalysisService = require('../services/analysisService');
const logger = require('../utils/logger');
const constants = require('../config/constants');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Handle POST /api/analysis
 * Analyzes a ticket using AI
 */
const handleAnalyzeTicket = asyncHandler(async (req, res) => {
  const { ticket, llmApiKey } = req.body;

  if (!ticket) {
    logger.warn('Missing ticket in analysis request');
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
      error: constants.ERROR_MESSAGES.MISSING_TICKET_DATA,
    });
  }

  const result = await AnalysisService.analyzeTicket(ticket, llmApiKey);

  res.json(result);
});

module.exports = {
  handleAnalyzeTicket,
};
