# DocMind AI — RAG-based Intelligent Study Assistant

> Upload your academic PDFs and talk to them. DocMind AI uses a full RAG pipeline to retrieve relevant context from your documents and generate precise answers using LLaMA 3.3 70B via Groq.

![Stack](https://img.shields.io/badge/React.js-18-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![Stack](https://img.shields.io/badge/Pinecone-Vector%20DB-000000?style=flat-square)
![Stack](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036?style=flat-square)
![Stack](https://img.shields.io/badge/MongoDB-Auth-47A248?style=flat-square&logo=mongodb)

---

## What is DocMind AI?

DocMind AI is a full-stack **Retrieval-Augmented Generation (RAG)** system that lets students and researchers upload PDF documents and ask natural language questions about them. Instead of hallucinating answers, the AI retrieves the most relevant chunks from your documents and grounds its response in your actual content.

---

## Features

- **PDF Upload & Processing** — drag and drop PDFs, auto-parsed and chunked with overlap
- **Semantic Search** — embeddings stored in Pinecone for fast vector similarity search
- **AI Q&A** — context-aware answers powered by LLaMA 3.3 70B via Groq
- **Per-user Isolation** — each user has their own Pinecone namespace, fully isolated
- **Question History** — all past Q&A sessions saved and searchable
- **JWT Authentication** — secure register/login with bcrypt password hashing
- **Dark Academic UI** — built in React.js with a clean dark theme

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, React Router v6, CSS3 |
| Backend | Node.js, Express.js |
| Vector Database | Pinecone (cloud, persistent, free tier) |
| Embeddings | all-MiniLM-L6-v2 via @xenova/transformers (local, free) |
| LLM | LLaMA 3.3 70B via Groq API |
| Auth | JWT + bcryptjs |
| Database | MongoDB + Mongoose |
| File Handling | Multer |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     React Client                     │
│   Auth · Dashboard · Upload · Chat · History        │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│                  Express Server                      │
│   /api/auth   /api/upload   /api/ask                │
└──────┬──────────────┬───────────────┬───────────────┘
       │              │               │
  MongoDB         AI Service       Pinecone
  (users)     ┌─────────────┐   (vector store)
              │ parse PDF   │
              │ chunk text  │
              │ embed chunks│
              │ store/search│
              │ Groq LLM    │
              └─────────────┘
```

### RAG Flow

```
Upload:  PDF → parse text → chunk (800 chars, 150 overlap)
              → embed (all-MiniLM-L6-v2) → store in Pinecone

Query:   question → embed → Pinecone similarity search (top 5)
              → build prompt with context → LLaMA 3.3 70B → answer
```

---

## Project Structure

```
docmind-ai/
├── client/                        # React frontend
│   └── src/
│       ├── pages/
│       │   ├── AuthPage.js        # Login & Register
│       │   ├── DashboardPage.js   # Overview & stats
│       │   ├── ChatPage.js        # AI chat interface
│       │   ├── UploadPage.js      # PDF upload
│       │   └── HistoryPage.js     # Q&A history
│       ├── components/
│       │   ├── Sidebar.js
│       │   └── Layout.js
│       ├── context/AuthContext.js
│       ├── hooks/
│       │   ├── useChatHistory.js
│       │   └── useUploadedFiles.js
│       └── services/api.js
│
├── server/                        # Express backend
│   ├── index.js
│   ├── Dockerfile
│   ├── config/db.js
│   ├── models/User.js
│   ├── middleware/authMiddleware.js
│   ├── controllers/authController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── askRoutes.js
│   └── ai-service/                # RAG pipeline
│       ├── embed.js               # Local embeddings
│       ├── vectorStore.js         # Pinecone operations
│       ├── parser.js              # PDF text extraction
│       ├── chunker.js             # Overlapping chunking
│       ├── processFile.js         # Upload pipeline
│       ├── ask.js                 # Query pipeline
│       └── llm.js                 # Groq API
│
└── uploads/                       # Temp PDF storage
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key — free at [console.groq.com](https://console.groq.com)
- Pinecone API key — free at [pinecone.io](https://pinecone.io)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/docmind-ai.git
cd docmind-ai
```

### 2. Create a Pinecone Index

1. Go to [pinecone.io](https://pinecone.io) → sign up free
2. Click **Create Index** → **Custom settings** → **Vector embeddings**
3. Fill in:

| Field | Value |
|---|---|
| Index Name | `docmind` |
| Dimensions | `384` |
| Metric | `cosine` |
| Cloud | AWS · us-east-1 |

4. Copy your **API Key** and **Host URL** from the dashboard

### 3. Setup the server

```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values (see below)
node index.js
```

### 4. Setup the AI service

```bash
cd server/ai-service
npm install
# Embedding model downloads automatically on first use (~25MB)
```

### 5. Setup the React client

```bash
cd client
npm install
npm start
```

App runs at `http://localhost:3000`

---

## Environment Variables

Create `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/docmind-ai
JWT_SECRET=your_long_random_secret_here
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxxxxxxxxxxxxx
PINECONE_HOST=https://docmind-xxxxx.svc.aped-xxxx.pinecone.io
PORT=5000
```

---

## API Reference

### Auth

```
POST /api/auth/register   { name, email, password }
POST /api/auth/login      { email, password } → { token, user }
```

### Documents

```
POST /api/upload          multipart/form-data · file=<PDF>
                          Authorization: Bearer <token>
```

### Ask

```
POST /api/ask             { question }
                          Authorization: Bearer <token>
                          → { answer }
```

---

## Key Design Decisions

**Why Pinecone?**
Fully managed cloud vector database with a generous free tier. No server to run, no Python dependencies, no Docker complexity — just an API call. Perfect for production deployments on Render.

**Why local embeddings?**
`all-MiniLM-L6-v2` via `@xenova/transformers` runs entirely on your machine — no API key, no cost, no latency overhead from external calls. 384-dimension vectors with cosine similarity.

**Why overlapping chunks?**
A 150-character overlap between 800-character chunks prevents context from being lost at boundaries — a common RAG failure mode.

**Why Groq?**
LLaMA 3.3 70B on Groq is extremely fast (hundreds of tokens/sec) and has a generous free tier — ideal for a study assistant where response speed matters.

---

## License

MIT
