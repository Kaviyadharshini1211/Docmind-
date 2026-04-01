const faiss = require("faiss-node");

const dimension = 100;
const numVectors = 3;

const index = new faiss.IndexFlatL2(dimension);

// --- Test ADD variations ---

// Try A: flat plain JS Array
try {
  const flatA = Array(numVectors * dimension).fill(0.1);
  index.add(flatA);
  console.log("✅ add() Try A (flat plain Array) succeeded. Total:", index.ntotal());
} catch (e) {
  console.log("❌ add() Try A (flat plain Array):", e.message);
}

// Try B: array of plain arrays
try {
  const flatB = Array.from({ length: numVectors }, () => Array(dimension).fill(0.1));
  index.add(flatB);
  console.log("✅ add() Try B (array of arrays) succeeded. Total:", index.ntotal());
} catch (e) {
  console.log("❌ add() Try B (array of arrays):", e.message);
}

// Try C: array of Float32Arrays
try {
  const flatC = Array.from({ length: numVectors }, () => Float32Array.from(Array(dimension).fill(0.1)));
  index.add(flatC);
  console.log("✅ add() Try C (array of Float32Arrays) succeeded. Total:", index.ntotal());
} catch (e) {
  console.log("❌ add() Try C (array of Float32Arrays):", e.message);
}

// --- Test SEARCH (only runs if at least one add succeeded) ---
if (index.ntotal() > 0) {
  console.log("\n--- Testing search() ---");

  // Try 1: flat plain Array
  try {
    const r1 = index.search(Array(dimension).fill(0.1), 1);
    console.log("✅ search() Try 1 (flat plain Array):", r1);
  } catch (e) {
    console.log("❌ search() Try 1 (flat plain Array):", e.message);
  }

  // Try 2: wrapped flat plain Array
  try {
    const r2 = index.search([Array(dimension).fill(0.1)], 1);
    console.log("✅ search() Try 2 ([flat plain Array]):", r2);
  } catch (e) {
    console.log("❌ search() Try 2 ([flat plain Array]):", e.message);
  }

  // Try 3: Float32Array
  try {
    const r3 = index.search(Float32Array.from(Array(dimension).fill(0.1)), 1);
    console.log("✅ search() Try 3 (Float32Array):", r3);
  } catch (e) {
    console.log("❌ search() Try 3 (Float32Array):", e.message);
  }

  // Try 4: wrapped Float32Array
  try {
    const r4 = index.search([Float32Array.from(Array(dimension).fill(0.1))], 1);
    console.log("✅ search() Try 4 ([Float32Array]):", r4);
  } catch (e) {
    console.log("❌ search() Try 4 ([Float32Array]):", e.message);
  }
}