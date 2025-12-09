const axios = require('axios')
const { GoogleGenAI } = require("@google/genai");

async function callOpenAI(prompt, apiKey) {
  if (!apiKey) throw new Error('LLM apiKey required')
  const url = 'https://api.openai.com/v1/chat/completions'
  const body = {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.0,
  }
  const res = await axios.post(url, body, { headers: { Authorization: `Bearer ${apiKey}` } })
  const text = res.data?.choices?.[0]?.message?.content
  return text
}

async function callGemini(prompt, apiKey) {
  if (!apiKey) throw new Error('Gemini apiKey required')
  
  const genAI = new GoogleGenAI({apiKey});
  
  // Try gemini-1.5-flash first
  try {
    const response = await genAI.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    console.log('Calling Gemini model: gemini-1.5-flash');
    return response.text;
  } catch (e) {
    console.error('Gemini 1.5 Flash failed:', e.message);
    throw e;
  }
}

// This adapter requires an API key for generation; no local mocks are returned.
async function generate(prompt, { apiKey } = {}) {
  // Use provided key or fallback to env var
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('LLM apiKey required for generation')
  
  try {
    // Simple heuristic: Gemini keys usually start with AIza
    if (key.startsWith('AIza')) {
      return await callGemini(prompt, key);
    } else {
      return await callOpenAI(prompt, key);
    }
  } catch (e) {
    console.error('LLM call failed:', e && e.message)
    throw e
  }
}

async function repair(rawText, { apiKey, schema }) {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('LLM apiKey required for repair')
  
  const repairPrompt = `The following text is intended to be valid JSON conforming to this schema: ${JSON.stringify(schema)}\n\nOriginal:\n${rawText}\n\nPlease return only the corrected JSON object that validates against the schema.`
  
  try {
    if (key.startsWith('AIza')) {
      return await callGemini(repairPrompt, key)
    } else {
      return await callOpenAI(repairPrompt, key)
    }
  } catch (e) {
    console.error('Repair call failed:', e && e.message)
    throw e
  }
}

module.exports = { generate, repair }