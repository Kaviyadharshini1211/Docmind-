// ai-service/llm.js
require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate an answer using Groq LLaMA 3.3 70B
 * @param {string} systemPrompt - rules and persona for the model
 * @param {string} userPrompt   - the actual context + question
 */
async function generateAnswer(systemPrompt, userPrompt) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    temperature: 0.2,      // low = more factual, less creative
    top_p: 0.9,            // nucleus sampling — focused but not robotic
    frequency_penalty: 0.1, // slight penalty to avoid repetition
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  return response.choices[0].message.content;
}

module.exports = { generateAnswer };