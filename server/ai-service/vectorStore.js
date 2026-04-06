// ai-service/vectorStore.js
// Pinecone: persistent vector store, one namespace per user
// No separate server needed — just API calls to Pinecone cloud

const { Pinecone } = require("@pinecone-database/pinecone");
const { textToVector } = require("./embed");

const client = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const INDEX_NAME = "docmind";

function getIndex() {
  return client.index(INDEX_NAME);
}

/**
 * Store document chunks for a user.
 * Each user is isolated using Pinecone namespaces.
 * @param {string[]} chunks - text chunks from PDF
 * @param {string} userId - user ID for isolation
 * @param {string} fileId - unique ID for this file
 */
async function createStore(chunks, userId, fileId) {
  if (!chunks || chunks.length === 0) {
    throw new Error("No chunks to store");
  }

  const index = getIndex();
  const namespace = `user_${String(userId)}`;

  // Delete old vectors from this file if re-uploading
  try {
    await index.namespace(namespace).deleteMany({
      filter: { fileId: { $eq: String(fileId) } },
    });
  } catch (_) {
    // Namespace may not exist yet, that's fine
  }

  console.log(`Embedding ${chunks.length} chunks...`);
  const embeddings = await Promise.all(chunks.map((c) => textToVector(c)));

  // Build vectors in Pinecone format
  const vectors = chunks.map((chunk, i) => ({
    id: `${fileId}_chunk_${i}`,
    values: embeddings[i],
    metadata: {
      fileId: String(fileId),
      chunkIndex: i,
      userId: String(userId),
      text: chunk, // store text in metadata for retrieval
    },
  }));

  // Pinecone upsert in batches of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await index.namespace(namespace).upsert(batch);
  }

  console.log(`✅ Stored ${chunks.length} chunks in Pinecone for user ${userId}`);
}

/**
 * Search for relevant chunks for a user's query.
 * @param {string} query - the user's question
 * @param {string} userId - to search only their documents
 * @param {number} topK - number of results to return
 */
async function search(query, userId, topK = 5) {
  const index = getIndex();
  const namespace = `user_${String(userId)}`;

  const queryEmbedding = await textToVector(query);

  const results = await index.namespace(namespace).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  if (!results.matches || results.matches.length === 0) {
    throw new Error("No documents found. Please upload a file first.");
  }

  // Return the text chunks from metadata
  return results.matches.map((match) => match.metadata.text);
}

/**
 * Delete all vectors for a user
 */
async function clearUserStore(userId) {
  try {
    const index = getIndex();
    const namespace = `user_${String(userId)}`;
    await index.namespace(namespace).deleteAll();
    console.log(`Cleared namespace for user ${userId}`);
  } catch (_) {}
}

module.exports = { createStore, search, clearUserStore };