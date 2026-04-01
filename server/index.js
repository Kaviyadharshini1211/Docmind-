const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const askRoutes = require("./routes/askRoutes");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

connectDB();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://doc-mind-pink.vercel.app",   // ✅ removed trailing slash
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],          // ✅ explicit methods
  allowedHeaders: ["Content-Type", "Authorization"],             // ✅ explicit headers
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));   // ✅ handle ALL preflight OPTIONS requests

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ask", askRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Study Assistant API is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`MongoDB: ${process.env.MONGO_URI ? "✅ configured" : "❌ missing"}`);
  console.log(`Groq:    ${process.env.GROQ_API_KEY ? "✅ configured" : "❌ missing"}`);
  console.log(`JWT:     ${process.env.JWT_SECRET ? "✅ configured" : "❌ missing"}\n`);
});
