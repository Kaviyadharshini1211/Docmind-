// ai-service/vectorStore.js
// ChromaDB: persistent vector store, one collection per user
// Chroma stores data on disk at ./chroma-data (survives restarts)

const { ChromaClient } = require("chromadb");
const { textToVector } = require("./embed");

// ChromaDB client — connects to local Chroma server
// Run: npx chromadb@latest run --path ./chroma-data
const client = new ChromaClient({
  host: "127.0.0.1",
  port: 8000,
  path: "/api/v1"
});

/**
 * Get or create a ChromaDB collection for a specific user.
 * Each user gets their own isolated vector space.
 */
async function getUserCollection(userId) {
  const collectionName = `user_${userId}`;

  const collection = await client.getOrCreateCollection({
    name: collectionName,
    metadata: { "hnsw:space": "cosine" }, // cosine similarity for text
  });

  return collection;
}

/**
 * Store document chunks for a user.
 * Replaces existing documents if the same file is uploaded again.
 * @param {string[]} chunks - text chunks from PDF
 * @param {string} userId - user ID for isolation
 * @param {string} fileId - unique ID for this file (e.g. filename + timestamp)
 */
async function createStore(chunks, userId, fileId) {
  if (!chunks || chunks.length === 0) {
    throw new Error("No chunks to store");
  }

  const collection = await getUserCollection(userId);

  // Delete old documents from this file if re-uploading
  try {
    await collection.delete({ where: { fileId: fileId } });
  } catch (_) {
    // Collection may be empty, that's fine
  }

  // Embed all chunks
  console.log(`Embedding ${chunks.length} chunks...`);
  const embeddings = await Promise.all(chunks.map((c) => textToVector(c)));

  // Build IDs and metadata
  const ids = chunks.map((_, i) => `${fileId}_chunk_${i}`);
  const metadatas = chunks.map((_, i) => ({ fileId, chunkIndex: i, userId }));

  // Store in Chroma
  await collection.add({
    ids,
    embeddings,
    documents: chunks,
    metadatas,
  });

  console.log(`✅ Stored ${chunks.length} chunks in ChromaDB for user ${userId}`);
}

/**
 * Search for relevant chunks for a user's query.
 * @param {string} query - the user's question
 * @param {string} userId - to search only their documents
 * @param {number} topK - number of results to return
 */
async function search(query, userId, topK = 5) {
  const collection = await getUserCollection(userId);

  const count = await collection.count();
  if (count === 0) {
    throw new Error("No documents found. Please upload a file first.");
  }

  const queryEmbedding = await textToVector(query);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: Math.min(topK, count),
  });

  // results.documents is [[chunk1, chunk2, ...]]
  return results.documents[0];
}

/**
 * Delete all documents for a user (e.g. on account deletion)
 */
async function clearUserStore(userId) {
  const collectionName = `user_${userId}`;
  try {
    await client.deleteCollection({ name: collectionName });
    console.log(`Cleared collection for user ${userId}`);
  } catch (_) {
    // Collection didn't exist
  }
}

module.exports = { createStore, search, clearUserStore };
