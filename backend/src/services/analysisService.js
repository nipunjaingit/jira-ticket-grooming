/**
 * Analysis Service
 * Handles AI-powered ticket analysis using LLM adapters
 */

const { generate } = require('../llmAdapter');
const logger = require('../utils/logger');
const constants = require('../config/constants');

/**
 * AnalysisService class
 * Orchestrates ticket analysis through LLM
 */
class AnalysisService {
  /**
   * Generate system prompt for ticket analysis
   */
  static generateSystemPrompt() {
    return `You are a Senior Product Owner with expertise in Agile methodologies, user story grooming, and technical requirements analysis. Your task is to analyze Jira tickets and provide detailed grooming reports that help development teams understand and implement the requirements effectively. User will send Summary and Description of the ticket. The output should be a JSON object containing the following fields:
    Output JSON schema:
      {
        "summary": "Brief summary of the ticket",
        "score": "Number 0-100 representing quality of description",
        "goodPoints": ["List of well-defined aspects"],
        "missingPoints": ["List of missing critical information"],
        "mismatches": ["List of contradictions or ambiguities"],
        "uiSuggestions": ["List of UI/UX related suggestions"],
        "technicalSuggestions": ["List of technical implementation suggestions"],
        "acceptanceCriteria": ["Refined list of ACs"],
        "storyPoints": "Estimated story points (number)",
        "questions": ["List of clarifying questions to ask the reporter. Think as a User Story expert and what features and flows are missing in the ticket which needs to be handled either from BE or FE perspective. Make sure to cover edge cases as well."]
      }
    `;
  }

  /**
   * Generate user prompt from ticket data
   */
  static generateUserPrompt(ticket) {
    const summary = ticket.fields?.summary || 'No summary';
    const description = ticket.fields?.description
      ? JSON.stringify(ticket.fields.description)
      : 'No description';

    return `Ticket Summary: ${summary}\n\nDescription: ${description}`;
  }

  /**
   * Analyze ticket using LLM
   */
  static async analyzeTicket(ticket, llmApiKey) {
    try {
      if (!ticket || !ticket.fields) {
        throw {
          statusCode: constants.HTTP_STATUS.BAD_REQUEST,
          message: constants.ERROR_MESSAGES.MISSING_TICKET_DATA,
        };
      }

      logger.info('Starting ticket analysis', { ticketKey: ticket.key });

      const systemPrompt = this.generateSystemPrompt();
      const userPrompt = this.generateUserPrompt(ticket);

      // Call LLM
      logger.debug('Calling LLM for analysis');
      const result = await generate(systemPrompt, userPrompt, { apiKey: llmApiKey });

      // Parse and validate JSON response
      const analysisResult = this.parseAnalysisResult(result);

      logger.info('Successfully analyzed ticket', {
        ticketKey: ticket.key,
        score: analysisResult.score,
      });

      return analysisResult;
    } catch (error) {
      logger.error('Ticket analysis failed', {
        message: error.message,
        ticketKey: ticket?.key,
      });

      if (error.statusCode) {
        throw error;
      }

      throw {
        statusCode: constants.HTTP_STATUS.SERVER_ERROR,
        message: constants.ERROR_MESSAGES.ANALYSIS_FAILED,
      };
    }
  }

  /**
   * Parse and validate LLM response
   */
  static parseAnalysisResult(result) {
    try {
      // Clean up markdown code blocks if present
      const cleanResult = result
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const jsonResult = JSON.parse(cleanResult);

      // Validate required fields
      this.validateAnalysisResult(jsonResult);

      return jsonResult;
    } catch (error) {
      logger.error('Failed to parse analysis result', {
        message: error.message,
        originalResult: result.substring(0, 200),
      });

      throw {
        statusCode: constants.HTTP_STATUS.SERVER_ERROR,
        message: 'Failed to parse LLM response',
      };
    }
  }

  /**
   * Validate analysis result structure
   */
  static validateAnalysisResult(result) {
    const requiredFields = ['summary', 'score', 'goodPoints', 'missingPoints', 'acceptanceCriteria'];

    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate score is a number between 0-100
    if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) {
      throw new Error('Score must be a number between 0-100');
    }

    return true;
  }
}

module.exports = AnalysisService;
