import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default {
  async validateAuth(auth) {
    const response = await apiClient.get('/jira/myself', {
      headers: {
        'x-encoded-auth': auth,
      },
    });
    return response.data;
  },

  async getProjects(auth) {
    const response = await apiClient.get("/jira/projects", {
      headers: {
        "x-encoded-auth": auth,
      },
    });
    return response.data;
  },

  async getIssues(auth, projectId, startAt = 0, maxResults = 50, jql = "") {
    const response = await apiClient.get("/jira/issues", {
      headers: {
        "x-encoded-auth": auth,
      },
      params: {
        projectId,
        startAt,
        maxResults,
        jql,
      },
    });
    return response.data;
  },

  async getIssueDetails(auth, issueIdOrKey) {
    const response = await apiClient.get(`/jira/issue/${issueIdOrKey}`, {
      headers: {
        "x-encoded-auth": auth,
      },
    });
    return response.data;
  },

  async analyzeTicket(ticketData, apiKey) {
    const response = await apiClient.post("/analysis", {
      ticket: ticketData,
      llmApiKey: apiKey,
    });
    return response.data;
  },
};
