// ai-service/ask.js
const { search } = require("./vectorStore");
const { generateAnswer } = require("./llm");

/**
 * RAG pipeline: search relevant chunks → build prompt → generate answer
 * @param {string} query  - the user's question
 * @param {string} userId - to search only their documents
 */
async function askQuestion(query, userId) {
  if (!query || query.trim().length === 0) {
    throw new Error("Question cannot be empty");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  // 1. Retrieve relevant chunks from ChromaDB
  const results = await search(query, userId, 5);

  if (!results || results.length === 0) {
    throw new Error("No relevant content found. Please upload a document first.");
  }

  // 2. Build context from retrieved chunks
  const context = results
    .filter(Boolean)
    .map((chunk, i) => `[${i + 1}] ${chunk}`)
    .join("\n\n");

  // 3. Build prompt
  const prompt = `You are a helpful study assistant. Answer the question using ONLY the context provided below.
If the answer is not in the context, say "I couldn't find that in the uploaded document."
Be concise, clear, and accurate.

Context:
${context}

Question: ${query}

Answer:`;

  // 4. Generate answer via Groq
  const answer = await generateAnswer(prompt);

  return answer;
}

module.exports = { askQuestion };