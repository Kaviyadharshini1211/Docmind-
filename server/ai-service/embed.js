// ai-service/embed.js
// Uses @xenova/transformers for real local embeddings (free, no API key)
// Model: Xenova/all-MiniLM-L6-v2 (384 dimensions, fast, great for RAG)

let pipeline = null;

async function getEmbedder() {
  if (pipeline) return pipeline;

  // Lazy load to avoid slow startup
  const { pipeline: createPipeline } = await import("@xenova/transformers");
  pipeline = await createPipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  console.log("✅ Embedding model loaded");
  return pipeline;
}

async function textToVector(text) {
  const embedder = await getEmbedder();

  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  // Convert to plain JS Array
  return Array.from(output.data);
}

module.exports = { textToVector };