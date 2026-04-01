// ai-service/processFile.js
const path = require("path");
const { parsePDF } = require("./parser");
const { chunkText } = require("./chunker");
const { createStore } = require("./vectorStore");

/**
 * Full pipeline: PDF → text → chunks → embeddings → ChromaDB
 * @param {string} filePath - path to uploaded PDF
 * @param {string} userId   - owner of the document
 */
async function processFile(filePath, userId) {
  if (!userId) throw new Error("userId is required for storing documents");

  const text = await parsePDF(filePath);

  console.log("TEXT LENGTH:", text.length);

  if (!text || text.trim().length === 0) {
    throw new Error("PDF appears to be empty or unreadable");
  }

  const chunks = chunkText(text);

  console.log("CHUNKS COUNT:", chunks.length);

  if (chunks.length === 0) {
    throw new Error("No readable content in PDF");
  }

  // Use filename + timestamp as a unique file ID
  const fileId = path.basename(filePath, path.extname(filePath));

  await createStore(chunks, userId, fileId);

  console.log("✅ File processed and stored in ChromaDB");
}

module.exports = { processFile };