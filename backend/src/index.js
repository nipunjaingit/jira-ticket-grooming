require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')
const { generate } = require('./llmAdapter')

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.json())

// Middleware to prevent caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  next()
})

// Middleware to check for Jira Auth
const requireJiraAuth = (req, res, next) => {
  const auth = req.headers['x-encoded-auth']
  if (!auth) {
    return res.status(401).json({ error: 'Missing x-encoded-auth header' })
  }
  req.jiraAuth = auth
  next()
}

const getJiraClient = (auth) => {
  return axios.create({
    baseURL: process.env.JIRA_BASE_URL,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    }
  })
}

app.get('/api/jira/myself', requireJiraAuth, async (req, res) => {
  try {
    const client = getJiraClient(req.jiraAuth)
    const response = await client.get('/rest/api/3/myself')
    res.json(response.data)
  } catch (error) {
    console.error('Error fetching myself:', error.message)
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to validate credentials' })
  }
})

app.get('/api/jira/projects', requireJiraAuth, async (req, res) => {
  try {
    const client = getJiraClient(req.jiraAuth)
    const response = await client.get('/rest/api/3/project')
    res.json(response.data)
  } catch (error) {
    console.error('Error fetching projects:', error.message)
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch projects' })
  }
})

app.get('/api/jira/issues', requireJiraAuth, async (req, res) => {
  console.log("HERE");
  try {
    const { projectId, startAt, maxResults, jql } = req.query
    const client = getJiraClient(req.jiraAuth)
    
    let query = `project = ${projectId}`
    if (jql) {
      query += ` AND ${jql}`
    }
    query += ' ORDER BY created DESC'

    console.log('Fetching issues from Jira:', { query, startAt, maxResults });

    // Using /rest/api/3/search/jql as /rest/api/3/search is deprecated.
    // This endpoint uses nextPageToken for pagination instead of startAt.
    const params = {
      jql: query,
      maxResults: parseInt(maxResults) || 50,
      fields: ['summary', 'status', 'assignee', 'created', 'priority', 'issuetype'].join(',')
    }

    // Only add nextPageToken if startAt is provided and not "0" (initial state)
    if (startAt && startAt !== '0' && startAt !== 0) {
      params.nextPageToken = startAt
    }

    const response = await client.get('/rest/api/3/search/jql', { params })
    
    const { issues, nextPageToken } = response.data;
    
    // The new API returns nextPageToken directly. 
    // If nextPageToken is present, it means there are more pages.
    const isLast = !nextPageToken;

    res.json({
        issues,
        total: 0, // Total is not returned by the new API
        isLast,
        nextPageToken
    })
  } catch (error) {
    console.log('Error fetching issues:', error.message)
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch issues' })
  }
})

app.get('/api/jira/issue/:id', requireJiraAuth, async (req, res) => {
  try {
    const client = getJiraClient(req.jiraAuth)
    const response = await client.get(`/rest/api/3/issue/${req.params.id}`)
    res.json(response.data)
  } catch (error) {
    console.error('Error fetching issue details:', error.message)
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch issue details' })
  }
})

app.post('/api/analysis', async (req, res) => {
  try {
    const { ticket, llmApiKey } = req.body
    if (!ticket) {
      return res.status(400).json({ error: 'Ticket data is required' })
    }

    const systemPrompt = `You are a Senior Product Owner with expertise in Agile methodologies, user story grooming, and technical requirements analysis. Your task is to analyze Jira tickets and provide detailed grooming reports that help development teams understand and implement the requirements effectively. User will send Summary and Description of the ticket. The output should be a JSON object containing the following fields:
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
        "storyPoints": "Estimated story points (number)"
        "questions": ["List of clarifying questions to ask the reporter"]
      }
    `;

    const prompt = `Ticket Summary: ${ticket.fields.summary}\n\nDescription: ${ticket.fields.description ? JSON.stringify(ticket.fields.description) : 'No description'}`

    const result = await generate(systemPrompt, prompt, { apiKey: llmApiKey })
    
    // Try to parse JSON, if it fails, just return the text
    try {
        // Clean up markdown code blocks if present
        const cleanResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResult = JSON.parse(cleanResult);
        res.json(jsonResult);
    } catch (e) {
        res.json({ raw: result });
    }

  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
