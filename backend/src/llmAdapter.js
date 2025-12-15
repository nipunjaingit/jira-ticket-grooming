const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

async function callOpenAI(systemPrompt, prompt, apiKey) {
  if (!apiKey) throw new Error("LLM apiKey required");
  const url = "https://api.openai.com/v1/chat/completions";
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });
  const body = {
    model: "gpt-4o-mini",
    messages,
    temperature: 0.0,
  };
  const res = await axios.post(url, body, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = res.data?.choices?.[0]?.message?.content;
  return text;
}

async function callMistral(systemPrompt, prompt, apiKey) {
  console.log("Calling Mistral model: mistral-large-latest", apiKey);
  if (!apiKey) throw new Error("Mistral apiKey required");
  const url = "https://api.mistral.ai/v1/chat/completions";
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });
  const body = {
    model: "mistral-large-latest",
    messages,
    temperature: 0.0,
    response_format: { type: "json_object" },
  };
  const res = await axios.post(url, body, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = res.data?.choices?.[0]?.message?.content;
  return text;
}

async function callGemini(systemPrompt, prompt, apiKey) {
  if (!apiKey) throw new Error("Gemini apiKey required");

  const genAI = new GoogleGenAI({ apiKey });

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });
    console.log("Calling Gemini model: gemini-2.5-flash");
    return response.text;
  } catch (e) {
    console.error("Gemini 2.5 Flash failed:", e.message);
    throw e;
  }
}

// This adapter requires an API key for generation; no local mocks are returned.
async function generate(systemPrompt, prompt, { apiKey } = {}) {
  // Use provided key or fallback to env var (which is now the Mistral key)
  console.log("AA", apiKey);
  const key = apiKey || process.env.MISTRAL_API_KEY;
  console.log("AA key", key);
  if (!key) throw new Error("LLM apiKey required for generation");

  try {
    // Simple heuristic: Gemini keys usually start with AIza, Mistral keys start with dK
    if (key.startsWith("AIza")) {
      return await callGemini(systemPrompt, prompt, key);
    } else if (key.startsWith("sk-")) {
      return await callOpenAI(systemPrompt, prompt, key);
    } else if (key.startsWith("9GF")) {
      return await callMistral(systemPrompt, prompt, key);
    } else {
      // Default to OpenAI for unknown prefixes
      return await callOpenAI(systemPrompt, prompt, key);
    }
  } catch (e) {
    console.error("LLM call failed:", e && e.message);
    throw e;
  }
}

async function repair(rawText, { apiKey, schema }) {
  const key = apiKey || process.env.MISTRAL_API_KEY;
  if (!key) throw new Error("LLM apiKey required for repair");

  const repairPrompt = `The following text is intended to be valid JSON conforming to this schema: ${JSON.stringify(
    schema
  )}\n\nOriginal:\n${rawText}\n\nPlease return only the corrected JSON object that validates against the schema.`;

  try {
    if (key.startsWith("AIza")) {
      return await callGemini("", repairPrompt, key);
    } else if (key.startsWith("sk-")) {
      return await callOpenAI("", repairPrompt, key);
    } else if (key.startsWith("9GF")) {
      return await callMistral("", repairPrompt, key);
    } else {
      // Default to OpenAI for unknown prefixes
      return await callOpenAI("", repairPrompt, key);
    }
  } catch (e) {
    console.error("Repair call failed:", e && e.message);
    throw e;
  }
}

module.exports = { generate, repair };
