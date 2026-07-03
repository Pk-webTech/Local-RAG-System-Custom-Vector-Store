<div align="center">

# 🧠Local-RAG-System-Custom-Vector-Store

**A Vector Database built from scratch in Java.**  
Implements HNSW, KD-Tree, and Brute Force search side-by-side with a full RAG pipeline powered by a local LLM via Ollama.

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://adoptium.net)
[![Maven](https://img.shields.io/badge/Maven-3.9%2B-C71A36?style=flat-square&logo=apachemaven&logoColor=white)](https://maven.apache.org)
[![Javalin](https://img.shields.io/badge/Javalin-6.3-0096FF?style=flat-square)](https://javalin.io)
[![Ollama](https://img.shields.io/badge/Ollama-local%20LLM-black?style=flat-square)](https://ollama.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

[Features](#-features) · [How It Works](#-how-it-works) · [Setup](#-setup) · [API Reference](#-rest-api-reference) · [Architecture](#-architecture)

<br/>

![VectorDB Screenshot](https://raw.githubusercontent.com/Pk-webTech/VectorDB/main/assets/preview.png)

> *Built as an educational deep-dive into how production vector databases like Pinecone, Weaviate, and Chroma actually work under the hood — now in Java.*

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **3 Search Algorithms** | HNSW (production-grade), KD-Tree, Brute Force — run all three and compare speed |
| **3 Distance Metrics** | Cosine similarity, Euclidean distance, Manhattan distance |
| **16D Demo Vectors** | 20 pre-loaded semantic vectors across 4 categories (CS, Math, Food, Sports) |
| **2D PCA Scatter Plot** | Live visualization of semantic space — watch clusters form in real time |
| **Real Document Embedding** | Paste any text → Ollama embeds it with `nomic-embed-text` (768D) |
| **RAG Pipeline** | Ask questions about your documents → HNSW retrieves context → local LLM answers |
| **Full REST API** | CRUD endpoints: insert, delete, search, benchmark, hnsw-info |
| **Zero Cloud** | 100% local — no API keys, no external services, runs entirely on your machine |

---

## ⚙️ How It Works

```
Your Text
    │
    ▼
Ollama (nomic-embed-text)          ← converts text to a 768-dimensional vector
    │
    ▼
HNSW Index (Java)                  ← indexes the vector in a multilayer graph
    │
    ▼
Semantic Search                    ← finds nearest neighbors in vector space
    │
    ▼
Ollama (llama3.2)                  ← reads retrieved chunks, generates an answer
    │
    ▼
Answer
```

**HNSW** (Hierarchical Navigable Small World) is the same algorithm used by Pinecone, Weaviate, Chroma, and Milvus. It builds a multilayer graph where each layer is progressively sparser — searches start at the top layer and zoom in, achieving **O(log N)** complexity instead of O(N) for brute force.

---

## 🚀 Setup

### Prerequisites

You need **2 things** installed:

1. **JDK 17+** — [Download from Adoptium](https://adoptium.net/temurin/releases/)
2. **Ollama** *(optional, for RAG)* — [Download from ollama.com](https://ollama.com)

### Step 1 — Clone the repository

```bash
git clone https://github.com/Pk-webTech/VectorDB.git
cd VectorDB
```

### Step 2 — Pull Ollama models *(skip if not using RAG)*

```bash
ollama pull nomic-embed-text   # ~274 MB — embedding model
ollama pull llama3.2           # ~2 GB  — language model
```

### Step 3 — Build & Run

**Windows (one-click):**
```bat
build.bat
```
This auto-downloads Maven if not installed, compiles everything, and starts the server.

**Manual (any OS):**
```bash
mvn package
java -jar target/vectordb-1.0.0.jar
```

### Step 4 — Open the app

```
http://localhost:8080
```

---

## 🖥️ Using the Application

### Tab 1: Search (Demo Vectors)
Type any concept — `binary tree`, `sushi`, `basketball`, `calculus` — and search across 20 pre-loaded 16-dimensional semantic vectors. Compare HNSW, KD-Tree, and Brute Force side by side. Watch the matching point glow on the live 2D PCA scatter plot as semantic clusters emerge.

### Tab 2: Documents (Real Embeddings)
Paste any text — lecture notes, Wikipedia articles, research papers. Ollama embeds it with `nomic-embed-text` into a real 768-dimensional vector. Long documents are auto-split into overlapping 250-word chunks, each indexed separately in HNSW.

### Tab 3: Ask AI (RAG Pipeline)
Ask a question about your inserted documents. Behind the scenes:

1. Your question → embedded into a 768D vector
2. HNSW search → finds the 3 most semantically similar chunks
3. Retrieved chunks → sent as context to `llama3.2`
4. `llama3.2` → generates a grounded answer

Answers stream in with a typewriter effect. Click the context chips to see exactly which chunks the AI used.

---

## 🔌 REST API Reference

### Demo Vector Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/search?v=f1,f2,...&k=5&metric=cosine&algo=hnsw` | K-NN search |
| `POST` | `/insert` | Insert a demo vector |
| `DELETE` | `/delete/:id` | Delete by ID |
| `GET` | `/items` | List all demo vectors |
| `GET` | `/benchmark?v=...&k=5&metric=cosine` | Compare all 3 algorithms |
| `GET` | `/hnsw-info` | HNSW graph structure and layer stats |
| `GET` | `/stats` | Database statistics |

### Document & RAG Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/doc/insert` | `{"title":"...","text":"..."}` | Embed and store document |
| `GET` | `/doc/list` | — | List all stored documents |
| `DELETE` | `/doc/delete/:id` | — | Delete document chunk |
| `POST` | `/doc/search` | `{"question":"...","k":3}` | Fast semantic retrieval |
| `POST` | `/doc/ask` | `{"question":"...","k":3}` | RAG: retrieve + generate |
| `GET` | `/status` | — | Ollama status and model info |

### Example: Search via curl

```bash
curl "http://localhost:8080/search?v=0.9,0.8,0.7,0.6,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1&k=3&metric=cosine&algo=hnsw"
```

### Example: Ask a question via curl

```bash
curl -X POST http://localhost:8080/doc/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is dynamic programming?","k":3}'
```

---

## 🏗️ Architecture

### Project Structure

```
VectorDB/
├── pom.xml                                      ← Maven build (Javalin 6)
├── build.bat                                    ← One-click Windows build & run
├── run.bat                                      ← Launch server after building
└── src/main/
    ├── java/com/vectordb/
    │   ├── Main.java                            ← Entry point, server bootstrap
    │   ├── algorithms/
    │   │   ├── BruteForce.java                  ← O(N·d) — exact, baseline
    │   │   ├── KDTree.java                      ← O(log N) — axis-aligned partitioning
    │   │   └── HNSW.java                        ← O(log N) — multilayer small-world graph
    │   ├── db/
    │   │   ├── VectorDB.java                    ← Unified 16D index over all 3 algorithms
    │   │   ├── DocumentDB.java                  ← HNSW over real Ollama embeddings (768D)
    │   │   └── DemoData.java                    ← 20 pre-loaded semantic vectors
    │   ├── api/
    │   │   └── Routes.java                      ← All REST endpoints (Javalin handlers)
    │   ├── models/
    │   │   ├── VectorItem.java
    │   │   └── DocItem.java
    │   └── util/
    │       ├── DistanceMetrics.java             ← Cosine / Euclidean / Manhattan
    │       ├── OllamaClient.java                ← HTTP client → /api/embeddings + /api/generate
    │       ├── JsonUtil.java                    ← Manual JSON helpers (zero deps)
    │       └── TextChunker.java                 ← 250-word chunks, 30-word overlap
    └── resources/
        └── index.html                           ← Frontend (bundled inside JAR)
```

### Algorithm Deep Dive

#### HNSW (Hierarchical Navigable Small World)

```
Layer 2:   1 ──────── 5                          (few nodes, long-range connections)
Layer 1:   1 ── 3 ── 5 ── 8 ── 12               (moderate density)
Layer 0:   1─2─3─4─5─6─7─8─9─10─11─12─...       (all nodes, fine-grained search)
```

- **Insert:** Randomly assign a max layer using `floor(-ln(uniform) / ln(M))`. Greedily descend from the top layer, running beam search at each layer to find and connect M nearest neighbors bidirectionally.  
- **Search:** Descend from top layer greedily. At layer 0, expand a candidate heap of size `ef` and return the K nearest.  
- **Why it's fast:** Upper layers act as a highway — you get to the right neighborhood quickly, then zoom in at layer 0.  
- **Parameters:** `M=16`, `M₀=32`, `ef_construction=200` — same as production defaults.

#### KD-Tree

Binary space partitioning. Each node splits space along one axis (cycling through all dimensions). Search prunes entire subtrees when the closest possible point in that subtree can't beat the current best.

**Weakness:** Degrades with high dimensions (curse of dimensionality). Works well at ≤20D, becomes close to brute force at 768D. That's why HNSW is used for the document index.

#### Why HNSW Wins at High Dimensions

KD-Tree pruning relies on axis-aligned distance bounds. In high dimensions, almost all the space is near the boundary of the hypersphere — no subtrees get pruned, and the search degenerates to O(N). HNSW's graph-based approach doesn't have this problem because it doesn't rely on geometric partitioning at all.

### Tech Stack

| Layer | Technology |
|-------|------------|
| HTTP Server | [Javalin 6](https://javalin.io) (embedded Jetty) |
| Search Algorithms | Pure Java — HNSW, KD-Tree, Brute Force (zero deps) |
| Embeddings | Ollama `nomic-embed-text` (768D) |
| LLM | Ollama `llama3.2` (local) |
| Frontend | Vanilla JS + D3.js (PCA scatter plot, chat UI) |
| Build | Apache Maven 3.9 + Maven Shade Plugin (fat JAR) |

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `Ollama: OFFLINE` shown in header | Run `ollama serve` in a terminal |
| Embedding takes forever | Ollama is downloading the model on first use, wait ~2 min |
| Port 8080 already in use | Windows: `netstat -ano \| findstr 8080` then `taskkill /PID <pid> /F` |
| LLM answer is slow | Normal — `llama3.2` takes 10–30s on CPU. Switch to `llama3.2:1b` for faster answers |
| `mvn: command not found` | Run `build.bat` — it downloads Maven automatically |

### Use a Smaller/Faster LLM

If `llama3.2` is too slow:

```bash
ollama pull llama3.2:1b
```

Then edit `Main.java`:
```java
ollama.genModel = "llama3.2:1b";
```

Rebuild with `mvn package` and restart.

---

## 🗺️ Roadmap

- [ ] Persistent storage (serialize HNSW graph to disk)
- [ ] Multi-collection support
- [ ] Batch insert endpoint
- [ ] gRPC API alongside REST
- [ ] Docker image
- [ ] Benchmarks vs Chroma / Qdrant at scale

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE) © 2026 [Pk-webTech](https://github.com/Pk-webTech)

---

<div align="center">

If this project helped you understand vector databases, consider giving it a ⭐

</div>
