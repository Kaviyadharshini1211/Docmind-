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

  // 1. Retrieve relevant chunks from Pinecone
  const results = await search(query, userId, 5);

  if (!results || results.length === 0) {
    throw new Error("No relevant content found. Please upload a document first.");
  }

  // 2. Build numbered context from retrieved chunks
  const context = results
    .filter(Boolean)
    .map((chunk, i) => `[CHUNK ${i + 1}]\n${chunk.trim()}`)
    .join("\n\n---\n\n");

  // 3. Detect question type for tailored instruction
  const q = query.trim().toLowerCase();
  const isSummary   = q.startsWith("summarize") || q.startsWith("summary") || q.includes("overview") || q.includes("briefly");
  const isList      = q.startsWith("list") || q.startsWith("what are") || q.startsWith("give me");
  const isExplain   = q.startsWith("explain") || q.startsWith("how does") || q.startsWith("what is") || q.startsWith("describe");
  const isCompare   = q.includes("difference") || q.includes("compare") || q.includes("vs") || q.includes("versus");

  let styleInstruction = "Give a clear, direct answer in 2–4 sentences.";
  if (isSummary) styleInstruction = "Provide a structured summary with the key points from the context.";
  if (isList)    styleInstruction = "Respond with a numbered or bulleted list of items found in the context.";
  if (isExplain) styleInstruction = "Explain clearly and thoroughly using only what is stated in the context.";
  if (isCompare) styleInstruction = "Structure your answer to clearly highlight the differences or comparisons found in the context.";

  // 4. Build optimized system + user prompt
  const systemPrompt = `You are DocMind AI — a precise, reliable study assistant that answers questions strictly based on provided document context.

CORE RULES (never break these):
1. Answer ONLY using the information in the DOCUMENT CONTEXT below. Do not use any outside knowledge.
2. If the answer is not found in the context, respond EXACTLY with: "I couldn't find that in the uploaded document. Try rephrasing your question or uploading a more relevant document."
3. Never guess, assume, or infer information that is not explicitly stated in the context.
4. Never fabricate facts, statistics, names, dates, or definitions.
5. If the context partially answers the question, give what you found and clearly state what is missing.
6. Do not repeat the question back to the user.
7. Do not mention that you are using "context" or "chunks" — answer naturally as if you read the document.
8. Do not say "Based on the provided context..." — just answer directly.

RESPONSE QUALITY RULES:
- Be accurate above all else.
- ${styleInstruction}
- Use clear, academic language suitable for a student.
- If the answer spans multiple chunks, synthesize them into one cohesive response.
- Format with bullet points or numbered lists only when the question asks for a list.
- Keep answers focused — do not pad with unnecessary filler sentences.`;

  const userPrompt = `DOCUMENT CONTEXT:
${context}

STUDENT QUESTION:
${query}

ANSWER:`;

  // 5. Generate answer via Groq
  const answer = await generateAnswer(systemPrompt, userPrompt);

  return answer;
}

module.exports = { askQuestion };