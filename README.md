# Jira Ticket Grooming Tool

A comprehensive tool designed to help Product Owners and teams groom Jira tickets effectively. It analyzes ticket descriptions using AI to provide quality scores, identify missing information, suggest improvements, and estimate story points.

# NOTE

This application is made using AI tools and agents.

## Features

- **Jira Integration**: Securely connect to your Jira instance to fetch projects and issues.
- **AI Analysis**: Uses advanced LLMs (Gemini/OpenAI) to analyze ticket content.
- **Quality Scoring**: Get a 0-100 score on the quality of your ticket description.
- **Smart Suggestions**: Receive actionable feedback on missing acceptance criteria, UI/UX suggestions, and technical considerations.
- **Lazy Loading**: Efficiently browse through large backlogs with infinite scroll pagination.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Jira account (Cloud)
- An API Key for Google Gemini or OpenAI

## Project Structure

The project is divided into two main parts:
- `backend/`: Express.js server handling Jira API proxying and AI integration.
- `frontend/`: Vue.js 3 + Tailwind CSS application for the user interface.

## Setup & Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ticket-grooming
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=3000

# Jira Configuration
# The base URL of your Jira instance (e.g., https://your-domain.atlassian.net)
JIRA_BASE_URL=https://your-company.atlassian.net

# AI Configuration (Optional default key, can also be provided via UI)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

## Running the Application

You need to run both the backend and frontend servers concurrently.

### Start the Backend

In the `backend/` directory:

```bash
# Run in development mode (with nodemon)
npm run dev

# Or run in production mode
npm start
```
The server will start on `http://localhost:3000`.

### Start the Frontend

In the `frontend/` directory:

```bash
npm run dev
```
The application will typically start on `http://localhost:5173` (check the terminal output for the exact URL).

## Usage

1. Open the frontend URL in your browser.
2. **Login**: Enter your Jira Email and API Token.
   - *Note: The credentials are encoded and stored locally in your browser. They are passed to the backend via headers for each request.*
3. **Select Project**: Choose a project from the dropdown to view its tickets.
4. **View Tickets**: Scroll through the list of tickets. Click on a ticket to view details.
5. **Analyze**: Click the "AI Analysis" button on the ticket details page to generate a grooming report.

## Troubleshooting

- **CORS Errors**: Ensure the backend is running and the frontend is pointing to the correct API URL.
- **Jira Connection**: Verify your `JIRA_BASE_URL` in the backend `.env` and ensure your Email/API Token are correct.
- **AI Errors**: Check if your API Key is valid and has quota available.
