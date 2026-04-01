// ai-service/chunker.js
// Chunks text with overlap so context isn't lost at chunk boundaries

/**
 * Split text into overlapping chunks for better RAG retrieval.
 * @param {string} text
 * @param {number} chunkSize   - characters per chunk (default 800)
 * @param {number} overlap     - overlap between chunks (default 150)
 */
function chunkText(text, chunkSize = 800, overlap = 150) {
  if (!text || text.trim().length === 0) return [];

  // Normalize whitespace
  const cleaned = text.replace(/\s+/g, " ").trim();

  const chunks = [];
  let start = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    const chunk = cleaned.slice(start, end).trim();

    if (chunk.length > 20) { // skip tiny chunks
      chunks.push(chunk);
    }

    if (end === cleaned.length) break;
    start += chunkSize - overlap; // slide window with overlap
  }

  return chunks;
}

module.exports = { chunkText };