const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, TableOfContents
} = require('docx');
const fs = require('fs');

// ── Colour palette ──────────────────────────────────────────
const C = {
  navy:    "1B2A4A",
  blue:    "2E75B6",
  cyan:    "00A9C7",
  purple:  "5B4EA0",
  teal:    "1C7A6C",
  orange:  "C45E10",
  gray:    "F2F4F8",
  dgray:   "D9DCE3",
  white:   "FFFFFF",
  black:   "000000",
  code:    "F0F3F8",
  codebrd: "C8D0DC",
};

// ── Helpers ─────────────────────────────────────────────────
const b = (text, color = C.black) =>
  new TextRun({ text, bold: true, color, font: "Arial" });

const t = (text, color = C.black, size = 22) =>
  new TextRun({ text, color, font: "Arial", size });

const code = (text) =>
  new TextRun({ text, font: "Courier New", size: 20, color: "C45E10", shading: { type: ShadingType.CLEAR, fill: C.code } });

const p = (children, options = {}) =>
  new Paragraph({ children: Array.isArray(children) ? children : [children], ...options });

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: "Arial", size: 40, bold: true, color: C.navy })],
  spacing: { before: 480, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.blue, space: 6 } }
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: "Arial", size: 30, bold: true, color: C.blue })],
  spacing: { before: 360, after: 160 },
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: C.teal })],
  spacing: { before: 280, after: 120 },
});

const h4 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_4,
  children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: C.purple })],
  spacing: { before: 220, after: 100 },
});

const body = (text) => new Paragraph({
  children: [new TextRun({ text, font: "Arial", size: 22, color: "1A1A2E" })],
  spacing: { after: 140 },
  alignment: AlignmentType.JUSTIFIED,
});

const bullet = (text, level = 0) => new Paragraph({
  numbering: { reference: "bullets", level },
  children: [new TextRun({ text, font: "Arial", size: 22, color: "1A1A2E" })],
  spacing: { after: 80 },
});

const numbered = (text, level = 0) => new Paragraph({
  numbering: { reference: "numbers", level },
  children: [new TextRun({ text, font: "Arial", size: 22, color: "1A1A2E" })],
  spacing: { after: 100 },
});

const codeBlock = (lines) => {
  const rows = lines.map(line => new TableRow({
    children: [new TableCell({
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      width: { size: 9100, type: WidthType.DXA },
      shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 180, right: 180 },
      children: [new Paragraph({
        children: [new TextRun({ text: line || " ", font: "Courier New", size: 19, color: "A6E3A1" })],
        spacing: { after: 0 },
      })]
    })]
  }));
  return new Table({
    width: { size: 9100, type: WidthType.DXA },
    columnWidths: [9100],
    rows,
    margins: { top: 100, bottom: 100 },
  });
};

const infoBox = (title, text, fillColor = "E8F4FD", borderColor = C.blue) => new Table({
  width: { size: 9100, type: WidthType.DXA },
  columnWidths: [9100],
  rows: [new TableRow({
    children: [new TableCell({
      borders: { top: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor }, left: { style: BorderStyle.SINGLE, size: 18, color: borderColor }, right: { style: BorderStyle.SINGLE, size: 4, color: borderColor } },
      width: { size: 9100, type: WidthType.DXA },
      shading: { fill: fillColor, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [
        new Paragraph({ children: [new TextRun({ text: title, font: "Arial", size: 22, bold: true, color: borderColor })], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 21, color: "1A1A2E" })], alignment: AlignmentType.JUSTIFIED, spacing: { after: 0 } }),
      ]
    })]
  })],
});

const twoColTable = (headers, rows, colWidths) => {
  const borderColor = C.dgray;
  const bdr = { style: BorderStyle.SINGLE, size: 1, color: borderColor };
  const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: C.navy, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 21, bold: true, color: C.white })], alignment: AlignmentType.CENTER })]
    }))
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders,
      width: { size: colWidths[ci], type: WidthType.DXA },
      shading: { fill: ri % 2 === 0 ? C.white : C.gray, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 140, right: 140 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Arial", size: 20, color: "1A1A2E" })], alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER })]
    }))
  }));

  return new Table({ width: { size: 9100, type: WidthType.DXA }, columnWidths: colWidths, rows: [headerRow, ...dataRows] });
};

const spacer = (after = 160) => new Paragraph({ children: [new TextRun("")], spacing: { after } });

const pageBreak = () => new Paragraph({ children: [new PageBreak()], spacing: { after: 0 } });

// ══════════════════════════════════════════════════════════════
//  DOCUMENT CONTENT
// ══════════════════════════════════════════════════════════════
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.DECIMAL, text: "%1.%2.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      ]},
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 40, bold: true, font: "Arial", color: C.navy },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: C.blue },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: C.teal },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 2 } },
      { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: C.purple },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 3 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 }
      }
    },
    headers: {
      default: {
        options: {
          children: [new Paragraph({
            children: [
              new TextRun({ text: "VectorDB — Complete Learning Guide", font: "Arial", size: 18, color: C.blue }),
              new TextRun({ text: "        |        ", font: "Arial", size: 18, color: C.dgray }),
              new TextRun({ text: "Piyush Kumar", font: "Arial", size: 18, color: "888888" }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 6 } },
            spacing: { after: 0 },
          })]
        }
      }
    },
    footers: {
      default: {
        options: {
          children: [new Paragraph({
            children: [
              new TextRun({ 
                children: ["Page ", PageNumber.CURRENT, "  |  VectorDB from Scratch"], 
                font: "Arial", 
                size: 18, 
                color: "888888" 
              }),
            ],
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.dgray, space: 6 } },
            alignment: AlignmentType.CENTER,
            spacing: { before: 0 },
          })]
        }
      }
    },
    children: [

      // ─── COVER ──────────────────────────────────────────────────
      spacer(1000),
      new Paragraph({
        children: [new TextRun({ text: "VECTORDB", font: "Arial", size: 80, bold: true, color: C.navy })],
        alignment: AlignmentType.CENTER, spacing: { after: 60 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Complete Learning Guide", font: "Arial", size: 36, color: C.blue })],
        alignment: AlignmentType.CENTER, spacing: { after: 60 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "From Scratch in Java", font: "Arial", size: 28, color: C.teal, italics: true })],
        alignment: AlignmentType.CENTER, spacing: { after: 600 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Algorithms \u00b7 Architecture \u00b7 RAG Pipeline \u00b7 How It All Works", font: "Arial", size: 22, color: "888888" })],
        alignment: AlignmentType.CENTER, spacing: { after: 1200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Piyush Kumar  |  VIT Vellore  |  B.Tech CSE (Information Security)", font: "Arial", size: 20, color: "888888" })],
        alignment: AlignmentType.CENTER, spacing: { after: 0 }
      }),
      pageBreak(),

      // ─── TABLE OF CONTENTS ──────────────────────────────────────
      h1("Table of Contents"),
      new TableOfContents("Table of Contents", {
        hyperlink: true,
        headingStyleRange: "1-4",
      }),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 1. PROJECT OVERVIEW
      // ══════════════════════════════════════════════════════════════
      h1("1. Project Overview"),

      body("VectorDB is a vector database built entirely from scratch in Java. It implements three different nearest-neighbour search algorithms side by side, so you can compare their speed and understand exactly how each one works. On top of the core search engine, it adds a complete Retrieval-Augmented Generation (RAG) pipeline powered by a local large language model via Ollama."),

      body("The project was ported from an original C++ codebase. The Java version replaces the single-header cpp-httplib HTTP server with Javalin (which embeds Jetty), and restructures the monolithic main.cpp into a clean, modular package hierarchy."),

      spacer(80),
      h2("1.1 What the System Does"),

      body("At the highest level, the system lets you do two things:"),

      numbered("Store vectors and search for the most similar ones (semantic similarity search over 16-dimensional demo vectors, or real 768-dimensional document embeddings)."),
      numbered("Ask questions in plain English about documents you have inserted. The system finds the most relevant document chunks, feeds them to a local LLM, and streams back a grounded answer."),

      spacer(80),
      h2("1.2 Tech Stack"),
      spacer(60),

      twoColTable(
        ["Layer", "Technology", "Why It Was Chosen"],
        [
          ["HTTP Server", "Javalin 6 (Jetty)", "Lightweight, zero-XML config, replaces cpp-httplib"],
          ["Search Algorithms", "Pure Java — HNSW, KD-Tree, BruteForce", "No external libs; total control for learning"],
          ["Embeddings", "Ollama nomic-embed-text (768D)", "Free, local, no API key"],
          ["LLM", "Ollama llama3.2", "Runs fully offline on CPU"],
          ["Frontend", "Vanilla JS + Canvas 2D", "No framework overhead; direct PCA scatter plot"],
          ["Build", "Maven 3.9 + Shade Plugin (fat JAR)", "Single JAR, zero deployment friction"],
        ],
        [3200, 3000, 2900]
      ),

      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 2. ARCHITECTURE
      // ══════════════════════════════════════════════════════════════
      h1("2. System Architecture"),

      body("The codebase is split into five packages, each with a single clear responsibility. Understanding the package boundaries is the first step to reading the code."),

      spacer(60),
      h2("2.1 Package Map"),
      spacer(60),

      codeBlock([
        "com.vectordb/",
        "  Main.java              \u2190 Entry point: starts server, loads demo data",
        "",
        "  algorithms/            \u2190 Pure math. No HTTP, no JSON, no I/O",
        "    BruteForce.java",
        "    KDTree.java",
        "    HNSW.java",
        "",
        "  db/                    \u2190 Business logic layer",
        "    VectorDB.java        \u2190 Wraps all 3 algorithms for 16D demo vectors",
        "    DocumentDB.java      \u2190 HNSW-only index for 768D Ollama embeddings",
        "    DemoData.java        \u2190 Preloaded 20 semantic vectors (CS/Math/Food/Sports)",
        "",
        "  api/",
        "    Routes.java          \u2190 All REST endpoints (replaces svr.Get/Post in C++)",
        "",
        "  models/",
        "    VectorItem.java      \u2190 id + metadata + category + float[] emb",
        "    DocItem.java         \u2190 id + title + text + float[] emb",
        "",
        "  util/",
        "    DistanceMetrics.java \u2190 cosine / euclidean / manhattan functions",
        "    OllamaClient.java    \u2190 HTTP client \u2192 /api/embeddings + /api/generate",
        "    JsonUtil.java        \u2190 Manual JSON helpers (zero external deps)",
        "    TextChunker.java     \u2190 250-word sliding window with 30-word overlap",
      ]),

      spacer(120),
      h2("2.2 Request Flow — Demo Vector Search"),

      body("When you type a query and click Search, here is exactly what happens, step by step:"),

      numbered("The browser sends GET /search?v=0.9,0.8,...&k=5&metric=cosine&algo=hnsw to the Javalin server."),
      numbered("Routes.java parses the query params. JsonUtil.parseVec() converts the comma-separated string into a List<Float>."),
      numbered("Routes calls VectorDB.search(q, k, metric, algo)."),
      numbered("VectorDB picks the right algorithm object (BruteForce / KDTree / HNSW) and calls its knn() method with the DistanceMetrics function."),
      numbered("The algorithm returns a list of (distance, id) pairs sorted nearest-first."),
      numbered("VectorDB resolves IDs back to VectorItem objects and wraps them in a SearchResult."),
      numbered("Routes.java serialises the result to JSON manually using JsonUtil helpers and sends the response."),
      numbered("The frontend draws glowing result cards and moves the star marker on the PCA scatter plot."),

      spacer(80),
      h2("2.3 Request Flow — RAG Pipeline"),

      body("The RAG (Retrieval-Augmented Generation) flow is more complex and involves Ollama at two separate points:"),

      numbered("User posts to POST /doc/ask with a JSON body containing the question."),
      numbered("OllamaClient.embed(question) calls Ollama /api/embeddings \u2192 returns a 768-dimensional float vector."),
      numbered("DocumentDB.search(qEmb, k) runs HNSW nearest-neighbour search over stored document chunk embeddings. Returns the top-k most semantically similar chunks."),
      numbered("Routes.java builds a prompt string: system instruction + retrieved chunk texts + the original question."),
      numbered("OllamaClient.generate(prompt) calls Ollama /api/generate (stream:false) \u2192 waits for the full answer."),
      numbered("The JSON response is sent back with the answer, the LLM model name, and the retrieved context chunks so the frontend can show them."),
      numbered("The frontend renders the answer with a typewriter effect and shows clickable context chips."),

      spacer(100),
      infoBox(
        "Key Insight: Why Two Separate Ollama Calls?",
        "Embedding and generation are fundamentally different tasks. nomic-embed-text is a small, fast encoder-only model optimised to produce dense semantic vectors. llama3.2 is a decoder-only generative model. Using the right tool for each task is exactly how production RAG systems (LangChain, LlamaIndex, etc.) are built.",
        "E8F4FD", C.blue
      ),

      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 3. SEARCH ALGORITHMS
      // ══════════════════════════════════════════════════════════════
      h1("3. Search Algorithms — Deep Dive"),

      body("The heart of any vector database is the nearest-neighbour search algorithm. VectorDB implements three: Brute Force (the correct baseline), KD-Tree (the classic exact method), and HNSW (the production algorithm). Understanding all three is essential for knowing when to use which."),

      spacer(40),

      infoBox(
        "The Core Problem: K-Nearest Neighbour (KNN) Search",
        "Given a query vector q and a database of N vectors, find the K vectors that are closest to q under some distance metric. This is the fundamental operation that powers semantic search, recommendation engines, and image retrieval. The challenge: doing it fast as N grows to millions.",
        "FFF3E0", C.orange
      ),

      spacer(120),

      // ── 3.1 BRUTE FORCE ──
      h2("3.1 Brute Force"),

      h3("How It Works"),
      body("Brute force is the simplest possible algorithm. For every query, it computes the distance from the query vector to every single vector in the database, then sorts the results and returns the K smallest distances."),

      codeBlock([
        "// BruteForce.java — knn() method (simplified)",
        "public List<float[]> knn(List<Float> q, int k,",
        "                         BiFunction<List<Float>, List<Float>, Float> dist) {",
        "  List<float[]> results = new ArrayList<>();",
        "  for (VectorItem v : items) {",
        "    results.add(new float[]{ dist.apply(q, v.emb), v.id });",
        "  }",
        "  results.sort(Comparator.comparingDouble(r -> r[0]));",
        "  return results.subList(0, Math.min(k, results.size()));",
        "}",
      ]),

      spacer(80),
      h3("Complexity"),
      bullet("Time: O(N \u00b7 d) per query. N = number of vectors, d = dimensionality."),
      bullet("Space: O(N \u00b7 d) to store all vectors."),
      bullet("Build time: O(1) \u2014 just append to a list."),

      spacer(80),
      h3("When to Use It"),
      bullet("Correctness baseline for benchmarking other algorithms."),
      bullet("Datasets small enough that O(N\u00b7d) is acceptable (typically N < 10,000 at low dimensions)."),
      bullet("In VectorDB: runs the benchmark comparison and validates HNSW recall."),

      spacer(120),

      // ── 3.2 KD-TREE ──
      h2("3.2 KD-Tree (K-Dimensional Tree)"),

      h3("Core Idea"),
      body("A KD-Tree is a binary space partitioning tree. It recursively divides the vector space with axis-aligned hyperplanes. Each internal node stores a vector and the axis it splits on. Points with a smaller coordinate on that axis go left; points with a larger coordinate go right. This structure lets the search prune entire subtrees that cannot possibly contain a nearest neighbour."),

      h3("Building the Tree"),
      body("In VectorDB, vectors are inserted one at a time. Insertion cycles through axes (axis = depth % dims). If the new vector's value on the current axis is less than the node's, it goes left; otherwise it goes right. Insertion is O(log N) on average for a balanced tree."),

      codeBlock([
        "// KDTree.java — insert (simplified)",
        "private Node insert(Node n, VectorItem v, int depth) {",
        "  if (n == null) return new Node(v);" ,
        "  int axis = depth % dims;" ,
        "  if (v.emb.get(axis) < n.item.emb.get(axis))" ,
        "       n.left  = insert(n.left,  v, depth + 1);" ,
        "  else n.right = insert(n.right, v, depth + 1);" ,
        "  return n;" ,
        "}" ,
      ]),

      spacer(80),
      h3("Searching the Tree"),
      body("Search is where the KD-Tree earns its speed. It descends the tree like a BST to find the nearest leaf, then backtracks and checks whether the other branch could possibly contain a closer point using the ball-within-hyperslab test:"),

      codeBlock([
        "// KDTree.java — knn (simplified)",
        "private void knn(Node n, List<Float> q, int k, int depth,",
        "                 BiFunction<...> dist, PriorityQueue<float[]> heap) {",
        "  if (n == null) return;" ,
        "  float dn = dist.apply(q, n.item.emb);" ,
        "  // Add to heap if it improves our best-K" ,
        "  if (heap.size() < k || dn < heap.peek()[0]) {" ,
        "    heap.offer(new float[]{dn, n.item.id});" ,
        "    if (heap.size() > k) heap.poll();" ,
        "  }" ,
        "  int axis = depth % dims;" ,
        "  float diff = q.get(axis) - n.item.emb.get(axis);" ,
        "  Node closer  = diff < 0 ? n.left  : n.right;" ,
        "  Node farther = diff < 0 ? n.right : n.left;" ,
        "  knn(closer, q, k, depth+1, dist, heap);" ,
        "  // Only explore farther branch if it could beat current best" ,
        "  if (heap.size() < k || Math.abs(diff) < heap.peek()[0])" ,
        "    knn(farther, q, k, depth+1, dist, heap);" ,
        "}" ,
      ]),

      spacer(80),
      h3("The Pruning Condition Explained"),
      body("The key line is: Math.abs(diff) < heap.peek()[0]. Here, diff is the distance from the query to the splitting hyperplane on the current axis. If this distance is already larger than the furthest of our current K best candidates, then every point in the farther subtree is at least that far away on this one axis, so they can't possibly be closer overall. We skip the entire subtree."),

      spacer(80),
      h3("Complexity"),
      bullet("Build time: O(N log N) to insert all N vectors."),
      bullet("Search: O(log N) average in low dimensions. Degrades toward O(N) at high dimensions."),
      bullet("Space: O(N \u00b7 d)."),

      spacer(80),
      h3("The Curse of Dimensionality"),
      body("KD-Trees work brilliantly at low dimensions (d \u2264 20). As d grows, the ball-within-hyperslab pruning becomes ineffective. In high dimensions, almost all the space is near the boundary of any hypersphere, meaning no subtrees get pruned and the search degenerates to brute force. This is why KD-Trees are used for the 16D demo vectors in VectorDB but HNSW is used for the 768D document embeddings."),

      spacer(120),

      // ── 3.3 HNSW ──
      h2("3.3 HNSW — Hierarchical Navigable Small World"),

      body("HNSW is the algorithm that powers Pinecone, Weaviate, Chroma, Milvus, and most production vector databases. It achieves O(log N) approximate nearest-neighbour search even at hundreds of dimensions. Understanding HNSW is the most valuable thing you can learn from this project."),

      spacer(40),
      infoBox(
        "Why 'Hierarchical Navigable Small World'?",
        "Hierarchical = the graph has multiple layers, each exponentially sparser than the layer below. Navigable = you can efficiently navigate from any node to any other. Small World = most nodes are reachable from any other via a short path (like the 'six degrees of separation' concept in social networks).",
        "F0F0FF", C.purple
      ),

      spacer(120),
      h3("3.3.1 The Multi-Layer Graph Structure"),

      body("HNSW maintains a graph of M layers (where M is a parameter, typically 16 in VectorDB). Every inserted vector becomes a node. Each node exists in layers 0 through its randomly assigned maximum layer. The key property:"),

      bullet("Layer 0 contains ALL nodes, with many connections (up to M0 = 2M per node)."),
      bullet("Each higher layer contains exponentially fewer nodes (roughly 1/M fraction of the layer below)."),
      bullet("Higher layer connections span longer distances in the vector space, acting like a highway network."),

      codeBlock([
        "// The layer structure visualised:",
        "",
        "Layer 3:  node_7  -------------------- node_19          (very few nodes, long range)",
        "Layer 2:  node_7 --- node_3 ----------- node_19 -- node_1",
        "Layer 1:  node_7 - node_3 - node_12 --- node_19 - node_1 - node_5",
        "Layer 0:  ALL nodes densely connected  (every node is here)",
        "",
        "// Search always starts at the TOP layer and descends to Layer 0",
      ]),

      spacer(80),
      h3("3.3.2 Assigning a Node to Its Maximum Layer"),

      body("When a new vector is inserted, its maximum layer is chosen randomly using:"),

      codeBlock([
        "// HNSW.java",
        "private final double mL = 1.0 / Math.log(M); // M = 16" ,
        "",
        "private int randomLevel() {" ,
        "  return (int) Math.floor(-Math.log(rng.nextDouble()) * mL);" ,
        "}" ,
        "",
        "// Result: most nodes get level 0, a few get 1, very few get 2+" ,
        "// This creates an exponential distribution of layer membership",
      ]),

      body("The formula -log(uniform) follows an exponential distribution. This guarantees that the number of nodes at each layer decreases exponentially going up, which is what gives HNSW its O(log N) search complexity."),

      spacer(80),
      h3("3.3.3 Insertion Algorithm"),

      body("Inserting a new vector into the HNSW graph is the most complex part. Here is the complete algorithm:"),

      numbered("Randomly assign a maximum layer L to the new node using the formula above."),
      numbered("Start at the entry point (the node at the very top layer)."),
      numbered("For each layer from topLayer down to L+1 (layers ABOVE the new node): do a greedy 1-nearest-neighbour search to find the best entry point for the next layer down."),
      numbered("For each layer from min(topLayer, L) down to 0 (layers the new node BELONGS to): run a beam search with ef_construction=200 candidates to find the M nearest neighbours. Connect the new node bidirectionally to these M neighbours."),
      numbered("If a neighbour's connection list exceeds M after adding the new back-edge, prune it to keep only the M nearest."),
      numbered("If L > topLayer, the new node becomes the new entry point."),

      codeBlock([
        "// HNSW.java — insert() simplified",
        "public void insert(VectorItem item, BiFunction<...> dist) {" ,
        "  int lvl = randomLevel();" ,
        "  graph.put(id, new Node(item, lvl));" ,
        "  int ep = entryPoint;" ,
        "",
        "  // Phase 1: descend from top to lvl+1 (greedy, ef=1)" ,
        "  for (int lc = topLayer; lc > lvl; lc--) {" ,
        "    List<float[]> W = searchLayer(item.emb, ep, 1, lc, dist);" ,
        "    ep = (int) W.get(0)[1];" ,
        "  }" ,
        "",
        "  // Phase 2: insert at each layer the node belongs to (beam, ef=200)" ,
        "  for (int lc = min(topLayer, lvl); lc >= 0; lc--) {" ,
        "    List<float[]> W = searchLayer(item.emb, ep, efBuild, lc, dist);" ,
        "    int maxM = (lc == 0) ? M0 : M;" ,
        "    List<Integer> selected = selectNeighbors(W, maxM);" ,
        "    // Connect new node to neighbours + add back-edges + prune" ,
        "    connectAndPrune(id, selected, lc, maxM, dist);" ,
        "    ep = (int) W.get(0)[1]; // best found becomes next entry point" ,
        "  }" ,
        "  if (lvl > topLayer) { topLayer = lvl; entryPoint = id; }" ,
        "}" ,
      ]),

      spacer(80),
      h3("3.3.4 Search Algorithm (K-NN Query)"),

      body("Searching is elegantly simple compared to insertion:"),

      numbered("Start at the entry point at the topmost layer."),
      numbered("For each layer from topLayer down to 1: run a greedy search (ef=1) to find the single best candidate. This descends quickly through the highway layers."),
      numbered("At layer 0: run a full beam search with ef = max(ef_search, k) to find K nearest neighbours."),
      numbered("Return the K closest from the beam search result."),

      codeBlock([
        "// HNSW.java — knn() simplified",
        "public List<float[]> knn(List<Float> q, int k, int ef,",
        "                          BiFunction<...> dist) {" ,
        "  int ep = entryPoint;" ,
        "",
        "  // Descend highway layers with greedy search (ef=1)" ,
        "  for (int lc = topLayer; lc > 0; lc--) {" ,
        "    List<float[]> W = searchLayer(q, ep, 1, lc, dist);" ,
        "    ep = (int) W.get(0)[1];" ,
        "  }" ,
        "",
        "  // Full beam search at layer 0" ,
        "  List<float[]> W = searchLayer(q, ep, Math.max(ef, k), 0, dist);" ,
        "  return W.subList(0, Math.min(k, W.size()));" ,
        "}" ,
      ]),

      spacer(80),
      h3("3.3.5 The Beam Search (searchLayer)"),

      body("Beam search (also called greedy best-first search with a fixed width) is the workhorse inside HNSW. It maintains two data structures simultaneously:"),

      bullet("candidates: a min-heap (smallest distance first) of nodes to explore next."),
      bullet("found: a max-heap (largest distance first, bounded to ef entries) of the best results found so far."),

      body("At each step: pop the closest unvisited candidate, compute distances to all its neighbours, add promising ones to both heaps. Stop when the closest remaining candidate is already further than the worst result in found. This guarantees we explore the most promising paths first while bounding total work."),

      spacer(80),
      h3("3.3.6 Why HNSW is Fast"),
      spacer(40),

      twoColTable(
        ["Property", "Benefit"],
        [
          ["Hierarchical layers", "Upper layers act as a coarse index. Search jumps quickly to the right region."],
          ["Greedy descent", "O(log N) hops to reach the correct neighbourhood."],
          ["Small world property", "Dense local connectivity means you never get stuck far from the target."],
          ["ef_construction=200", "High quality graph built at insert time \u2192 fast queries with high recall."],
          ["No axis-aligned assumptions", "Works equally well at 16D and 768D, unlike KD-Trees."],
          ["Graph-based, not tree-based", "No need to backtrack through the whole tree; connections directly encode proximity."],
        ],
        [3600, 5500]
      ),

      spacer(120),
      h3("3.3.7 HNSW Parameters in VectorDB"),
      spacer(40),

      twoColTable(
        ["Parameter", "Value", "Meaning"],
        [
          ["M", "16", "Max neighbours per node per layer (except layer 0)"],
          ["M0", "32 (2\u00d7M)", "Max neighbours at layer 0 (denser base layer)"],
          ["ef_construction", "200", "Beam width during insertion (higher = better graph quality)"],
          ["ef_search", "50", "Beam width during query (in VectorDB knn calls)"],
          ["mL", "1/ln(16) \u2248 0.361", "Layer assignment probability parameter"],
        ],
        [2400, 2200, 4500]
      ),

      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 4. DISTANCE METRICS
      // ══════════════════════════════════════════════════════════════
      h1("4. Distance Metrics"),

      body("All three search algorithms are metric-agnostic. They accept a distance function as a parameter. VectorDB implements three:"),

      spacer(80),
      h2("4.1 Cosine Similarity (Distance)"),

      body("Cosine distance measures the angle between two vectors, ignoring their magnitude. Two vectors pointing in the same direction have cosine distance 0; orthogonal vectors have distance 1."),

      codeBlock([
        "// DistanceMetrics.java",
        "public static float cosine(List<Float> a, List<Float> b) {" ,
        "  float dot = 0, na = 0, nb = 0;" ,
        "  for (int i = 0; i < a.size(); i++) {" ,
        "    dot += a.get(i) * b.get(i);" ,
        "    na  += a.get(i) * a.get(i);" ,
        "    nb  += b.get(i) * b.get(i);" ,
        "  }" ,
        "  return 1.0f - dot / (float)(Math.sqrt(na) * Math.sqrt(nb));" ,
        "  // Returns 0 (identical direction) to 2 (opposite direction)" ,
        "}" ,
      ]),

      body("Best for: text embeddings, semantic similarity, any task where the scale of the vector (how long it is) should not matter. Used by default in VectorDB for both demo and document search."),

      spacer(80),
      h2("4.2 Euclidean Distance (L2)"),

      body("The straight-line distance between two points in n-dimensional space. The most geometrically intuitive metric."),

      codeBlock([
        "public static float euclidean(List<Float> a, List<Float> b) {" ,
        "  float s = 0;" ,
        "  for (int i = 0; i < a.size(); i++) {" ,
        "    float d = a.get(i) - b.get(i);" ,
        "    s += d * d;" ,
        "  }" ,
        "  return (float) Math.sqrt(s);" ,
        "}" ,
      ]),

      body("Best for: image embeddings (CLIP), spatial data, cases where absolute distance in the embedding space is meaningful."),

      spacer(80),
      h2("4.3 Manhattan Distance (L1)"),

      body("Sum of absolute differences along each dimension. Imagine navigating a grid-city where you can only move horizontally or vertically."),

      codeBlock([
        "public static float manhattan(List<Float> a, List<Float> b) {" ,
        "  float s = 0;" ,
        "  for (int i = 0; i < a.size(); i++)" ,
        "    s += Math.abs(a.get(i) - b.get(i));" ,
        "  return s;" ,
        "}" ,
      ]),

      body("Best for: sparse vectors (many zeros), robustness to outliers in individual dimensions. Less common in NLP but used in some recommendation systems."),

      spacer(80),
      twoColTable(
        ["Metric", "Formula", "Best Use Case", "Sensitive To Scale?"],
        [
          ["Cosine", "1 \u2212 (a\u00b7b) / (|a||b|)", "Text / semantic similarity", "No"],
          ["Euclidean", "\u221a\u03a3(ai\u2212bi)\u00b2", "Image embeddings, spatial", "Yes"],
          ["Manhattan", "\u03a3|ai\u2212bi|", "Sparse vectors, tabular data", "Yes"],
        ],
        [2200, 2800, 2500, 1600]
      ),

      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 5. DATABASE LAYER
      // ══════════════════════════════════════════════════════════════
      h1("5. Database Layer"),

      h2("5.1 VectorDB — The 16D Demo Index"),

      body("VectorDB is the unified interface over all three algorithms for the 16-dimensional demo vectors. It maintains three separate index structures simultaneously and keeps them in sync."),

      codeBlock([
        "// VectorDB.java — state",
        "private final Map<Integer, VectorItem> store = new LinkedHashMap<>();" ,
        "private final BruteForce bf = new BruteForce();" ,
        "private final KDTree     kdt;        // needs rebuild on delete" ,
        "private final HNSW       hnsw;       // supports incremental delete" ,
        "private final AtomicInteger nextId = new AtomicInteger(1);" ,
      ]),

      body("One important design note: HNSW supports lazy deletion (just remove the node from the graph, back-edges naturally stop pointing to it). KD-Tree in VectorDB does not support lazy deletion, so when a vector is deleted, the entire KD-Tree is rebuilt from the remaining vectors in the store. This is fine for the 20-vector demo set but would be expensive at scale."),

      spacer(80),
      h2("5.2 DocumentDB — The 768D RAG Index"),

      body("DocumentDB is a simpler structure: HNSW only, purpose-built for high-dimensional real embeddings from Ollama. It also includes BruteForce as a fallback for very small collections (fewer than 10 documents) where HNSW would have insufficient nodes to build a meaningful graph."),

      codeBlock([
        "// DocumentDB.java — search logic",
        "public List<DocHit> search(List<Float> q, int k) {" ,
        "  List<float[]> raw = (store.size() < 10)" ,
        "    ? bf.knn(q, k, DistanceMetrics::cosine)      // fallback for tiny sets" ,
        "    : hnsw.knn(q, k, 50, DistanceMetrics::cosine);" ,
        "",
        "  // Only return results with cosine distance <= 0.7" ,
        "  // (i.e., at least 30% similar \u2014 filters out unrelated chunks)" ,
        "  return raw.stream()" ,
        "    .filter(r -> r[0] <= 0.7f)" ,
        "    .map(r -> new DocHit(r[0], store.get((int)r[1])))" ,
        "    .collect(toList());" ,
        "}" ,
      ]),

      spacer(80),
      h2("5.3 Text Chunking Strategy"),

      body("When you insert a long document, TextChunker splits it into overlapping segments before embedding. This is a critical design decision in RAG systems."),

      codeBlock([
        "// TextChunker.java",
        "public static List<String> chunk(String text, int chunkWords, int overlapWords) {" ,
        "  String[] words = text.trim().split(\"\\\\s+\");" ,
        "  int step = chunkWords - overlapWords; // 250 - 30 = 220 words per step" ,
        "  for (int i = 0; i < words.length; i += step) {" ,
        "    int end = Math.min(i + chunkWords, words.length);" ,
        "    chunks.add(String.join(\" \", Arrays.copyOfRange(words, i, end)));" ,
        "    if (end == words.length) break;" ,
        "  }" ,
        "}" ,
      ]),

      body("The 30-word overlap ensures that sentences split across chunk boundaries are still captured in at least one chunk. Without overlap, a question about the last sentence of chunk 1 / first sentence of chunk 2 might retrieve neither chunk."),

      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 6. OLLAMA INTEGRATION
      // ══════════════════════════════════════════════════════════════
      h1("6. Ollama Integration — OllamaClient"),

      body("OllamaClient.java is a hand-rolled Java HTTP client built on java.net.http.HttpClient (standard library, Java 11+). It talks to the local Ollama REST API with zero external dependencies."),

      h2("6.1 Getting Embeddings"),

      codeBlock([
        "// OllamaClient.java",
        "public List<Float> embed(String text) {" ,
        "  String body = '{\"model\":\"nomic-embed-text\",\"prompt\":\"' + esc(text) + '\"}';" ,
        "  // POST to http://127.0.0.1:11434/api/embeddings" ,
        "  // Response: {\"embedding\": [0.023, -0.041, 0.119, ...]}" , 
        "  // 768 floats for nomic-embed-text" ,
        "  return parseEmbedding(response.body());" ,
        "}" ,
      ]),

      body("The nomic-embed-text model converts any text string into a 768-dimensional float vector. Semantically similar texts produce vectors that are close in cosine distance. This is what makes the RAG retrieval meaningful: when you embed your question and compare it against embedded document chunks, the nearest chunks are genuinely the most relevant ones."),

      spacer(80),
      h2("6.2 Generating Answers"),

      codeBlock([
        "// OllamaClient.java",
        "public String generate(String prompt) {" ,
        "  String body = '{\"model\":\"llama3.2\",\"prompt\":\"' + esc(prompt) + '\",\"stream\":false}';" ,
        "  // POST to http://127.0.0.1:11434/api/generate" ,
        "  // Response: {\"response\": \"The answer is...\", \"done\": true}" ,
        "  return parseResponse(response.body());" ,
        "}" ,
      ]),

      spacer(80),
      h2("6.3 The RAG Prompt Template"),

      body("The quality of the RAG answer depends heavily on the prompt structure. VectorDB uses this template:"),

      codeBlock([
        "String prompt =",
        "  \"You are a helpful assistant. Answer the user's question directly. \" +" ,
        "  \"Use the provided context if it contains relevant information. \" +" ,
        "  \"If it doesn't, just use your own general knowledge. \" +" ,
        "  \"IMPORTANT: Do NOT mention the 'context' or say things like \" +" ,
        "  \"'the context doesn't mention'. Just answer the question naturally.\\n\\n\" +" ,
        "  \"Context:\\n\" + retrievedChunksText +" ,
        "  \"Question: \" + question + \"\\n\\nAnswer:\";" ,
      ]),

      body("The instruction to not mention the context is important for user experience. A well-designed RAG system should feel like talking to a knowledgeable assistant, not like watching someone read from a document."),

      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 7. REST API
      // ══════════════════════════════════════════════════════════════
      h1("7. REST API Reference"),

      body("Routes.java registers all endpoints with Javalin. Here is the complete API:"),

      spacer(60),
      h2("7.1 Demo Vector Endpoints"),
      spacer(40),

      twoColTable(
        ["Method + Path", "Description", "Key Params"],
        [
          ["GET /search", "KNN search over 16D demo vectors", "v=floats, k=5, metric=cosine, algo=hnsw"],
          ["POST /insert", "Insert a demo vector", "body: {metadata, category, embedding:[16 floats]}"],
          ["DELETE /delete/:id", "Delete by ID", "id in path"],
          ["GET /items", "List all 20 demo vectors", "\u2014"],
          ["GET /benchmark", "Run all 3 algos, return timing", "v=floats, k=5, metric=cosine"],
          ["GET /hnsw-info", "HNSW graph structure (nodes, edges, layers)", "\u2014"],
          ["GET /stats", "DB dimensions, algorithm list", "\u2014"],
        ],
        [2800, 3400, 2900]
      ),

      spacer(120),
      h2("7.2 Document & RAG Endpoints"),
      spacer(40),

      twoColTable(
        ["Method + Path", "Description"],
        [
          ["POST /doc/insert", "Chunk text, embed each chunk with Ollama, store in DocumentDB"],
          ["GET /doc/list", "List all stored document chunks with preview"],
          ["DELETE /doc/delete/:id", "Delete a document chunk by ID"],
          ["POST /doc/search", "Embed question + HNSW search, return context chunk titles (no LLM)"],
          ["POST /doc/ask", "Full RAG: embed \u2192 retrieve \u2192 generate, return answer + contexts"],
          ["GET /status", "Ollama availability, model names, doc count, dims"],
        ],
        [2800, 6300]
      ),

      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 8. FRONTEND
      // ══════════════════════════════════════════════════════════════
      h1("8. Frontend — The Visualiser"),

      body("The frontend (index.html, served from the JAR as a classpath resource) is a single-file Vanilla JS application. It has three tabs and a central PCA scatter plot."),

      spacer(60),
      h2("8.1 PCA Scatter Plot"),

      body("PCA (Principal Component Analysis) is used to project the 16-dimensional demo vectors down to 2D for visualisation. The pca2D() function implements the power iteration method to find the first two principal components (the directions of maximum variance)."),

      codeBlock([
        "// index.html — pca2D() overview",
        "function pca2D(embs) {" ,
        "  // 1. Mean-centre the data (subtract mean from each dimension)" ,
        "  const X = embs.map(e => e.map((v,i) => v - mean[i]));" ,
        "",
        "  // 2. Find PC1: direction of maximum variance (power iteration)" ,
        "  const pc1 = powerIter(X, null);" ,
        "",
        "  // 3. Find PC2: direction of maximum variance ORTHOGONAL to PC1" ,
        "  const pc2 = powerIter(X, pc1); // deflation: remove PC1 component" ,
        "",
        "  // 4. Project each embedding onto (PC1, PC2) to get 2D coordinates" ,
        "  return X.map(x => [dot(x, pc1), dot(x, pc2)]);" ,
        "}" ,
      ]),

      body("The result is that semantically similar vectors (CS, Math, Food, Sports) cluster visually on the plot. This is not a trick of the visualisation — it reflects genuine geometric separation in the original 16D embedding space."),

      spacer(80),
      h2("8.2 The Three Tabs"),

      h3("Search Tab"),
      bullet("Converts query text to a 16D demo embedding using a keyword-matching heuristic (textToEmbedding)."),
      bullet("Calls GET /search, renders result cards, moves the glowing star on the scatter plot."),
      bullet("Benchmark button calls GET /benchmark and shows animated bar chart comparison."),
      bullet("HNSW Graph Layers section calls GET /hnsw-info and shows node/edge counts per layer."),

      h3("Documents Tab"),
      bullet("Posts to POST /doc/insert with title and pasted text."),
      bullet("Shows Ollama status from GET /status."),
      bullet("Lists stored chunks from GET /doc/list with previews and delete buttons."),

      h3("Ask AI Tab"),
      bullet("Posts to POST /doc/ask and streams the answer with a typewriter effect (character-by-character interval)."),
      bullet("Shows context chips you can click to expand the retrieved text."),
      bullet("Also fires POST /doc/search in the background to light up the relevant document cluster on the scatter plot."),

      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 9. ALGORITHM COMPARISON
      // ══════════════════════════════════════════════════════════════
      h1("9. Algorithm Comparison Summary"),
      spacer(40),

      twoColTable(
        ["Property", "Brute Force", "KD-Tree", "HNSW"],
        [
          ["Search complexity", "O(N\u00b7d)", "O(log N) avg", "O(log N) approx"],
          ["Build complexity", "O(1)", "O(N log N)", "O(N log N)"],
          ["Exact vs Approximate", "Exact", "Exact", "Approximate (~95% recall)"],
          ["High dimensions (768D)", "Slow but works", "Degrades to O(N)", "Fast, no degradation"],
          ["Memory overhead", "Low", "Low", "Higher (graph edges)"],
          ["Delete support", "O(N) rebuild", "O(N) rebuild", "O(deg) lazy delete"],
          ["Production use", "Never (baseline only)", "Low-dim spatial data", "All major vector DBs"],
          ["VectorDB use", "Benchmark, tiny doc sets", "16D demo search", "768D doc search"],
        ],
        [3200, 1980, 1960, 1960]
      ),

      spacer(120),

      infoBox(
        "When to Use Each Algorithm",
        "Use Brute Force only as a correctness baseline. Use KD-Tree when your data is low-dimensional (d <= 20) and you need exact results. Use HNSW for everything else \u2014 especially text, image, or any embedding model output. The ~5% approximation error of HNSW is almost always acceptable in practice, and you gain orders of magnitude in speed.",
        "E8FFE8", C.teal
      ),

      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 10. KEY LEARNINGS
      // ══════════════════════════════════════════════════════════════
      h1("10. Key Learning Takeaways"),

      h2("10.1 Data Structures"),
      bullet("A PriorityQueue<float[]> is the right data structure for both the beam search candidates (min-heap) and the K-best results (max-heap, bounded to K). Understanding when to use each orientation is critical for implementing nearest-neighbour algorithms."),
      bullet("The HNSW graph is a Map<Integer, Node> where each Node stores a List<List<Integer>> of neighbour IDs per layer. The outer list is indexed by layer number."),
      bullet("ThreadSafety: all three algorithm classes use synchronized methods. This is important because Javalin handles each request in a thread from Jetty's thread pool."),

      spacer(80),
      h2("10.2 Algorithmic Patterns"),
      bullet("Greedy best-first search (beam search) is a general technique that appears in pathfinding, text generation (beam search decoding in LLMs), and vector search. The pattern is always the same: min-heap of candidates, max-heap of results, stop early."),
      bullet("The ball-within-hyperslab pruning in KD-Tree and the layer-skipping in HNSW are both examples of the same idea: using known geometric properties of the search space to avoid computing distances to points that cannot improve the current best answer."),
      bullet("Exponential random level assignment in HNSW (from the formula -log(uniform)*mL) is a probabilistic technique that guarantees the desired layer distribution without any coordination between insertions. This is why HNSW scales to billions of vectors."),

      spacer(80),
      h2("10.3 System Design"),
      bullet("The VectorDB class is a facade over three separate index structures. This pattern (one unified interface over multiple implementations) is how real databases support pluggable storage engines."),
      bullet("The two-phase RAG pipeline (embed-then-generate using two different models) is the standard architecture in LangChain, LlamaIndex, and all production RAG systems. The embedding model and the generation model should always be separate."),
      bullet("Text chunking with overlap is a RAG engineering detail that dramatically improves retrieval quality for long documents. Always chunk with overlap in production RAG."),
      bullet("The cosine distance threshold (0.7) in DocumentDB.search() is an important guardrail: it prevents the LLM from being fed irrelevant context that could confuse it or cause hallucinations."),

      spacer(80),
      h2("10.4 Java Specifics"),
      bullet("BiFunction<List<Float>, List<Float>, Float> is used to pass distance functions as first-class values, making the algorithms metric-agnostic without any inheritance hierarchy."),
      bullet("AtomicInteger for ID generation ensures thread-safe auto-increment without synchronizing the entire insert method."),
      bullet("The Maven Shade Plugin creates a fat JAR (all dependencies bundled) by using the ServicesResourceTransformer to merge META-INF/services files \u2014 critical for Javalin's SPI-based plugin loading."),

      pageBreak(),

      // ══════════════════════════════════════════════════════════════
      // 11. GLOSSARY
      // ══════════════════════════════════════════════════════════════
      h1("11. Glossary"),
      spacer(40),

      twoColTable(
        ["Term", "Definition"],
        [
          ["Vector Embedding", "A fixed-length array of floats that represents a piece of data (text, image, etc.) in a way that captures semantic meaning. Similar items have similar vectors."],
          ["KNN", "K-Nearest Neighbours. Finding the K data points closest to a query point under some distance metric."],
          ["HNSW", "Hierarchical Navigable Small World. A multi-layer graph structure for approximate nearest-neighbour search. O(log N) query time."],
          ["KD-Tree", "K-Dimensional Tree. A binary space partitioning tree for exact KNN in low dimensions. Degrades at high dimensions."],
          ["Cosine Similarity", "A measure of similarity between two vectors based on the angle between them. 1 = identical direction, 0 = orthogonal, -1 = opposite."],
          ["PCA", "Principal Component Analysis. A mathematical technique to reduce dimensionality while preserving maximum variance. Used in VectorDB to project 16D vectors to 2D for visualisation."],
          ["RAG", "Retrieval-Augmented Generation. A technique where a language model is given relevant retrieved documents as context before generating an answer."],
          ["Embedding Model", "A model (like nomic-embed-text) that converts raw data into embeddings. Encoder-only architecture, not generative."],
          ["LLM", "Large Language Model. A generative model (like llama3.2) that produces text. Used in VectorDB to generate the final answer from retrieved context."],
          ["Beam Search", "A search algorithm that maintains a fixed-width frontier of best candidates. Used inside HNSW's searchLayer() method."],
          ["ef_construction", "HNSW parameter: the beam width during insertion. Higher = better graph quality = better recall at query time, but slower inserts."],
          ["Chunking", "Splitting a long document into smaller overlapping segments for embedding. Required because embedding models have input length limits."],
          ["Javalin", "A lightweight Java/Kotlin web framework built on Jetty. Used in VectorDB as the HTTP server."],
          ["Ollama", "A local runtime for running open-source LLMs on your machine. Provides a REST API that VectorDB calls for both embedding and generation."],
          ["Fat JAR", "A single executable JAR file that contains all dependencies bundled inside. Built by the Maven Shade Plugin."],
        ],
        [2800, 6300]
      ),

      spacer(200),
      new Paragraph({
        children: [new TextRun({ text: "End of Document", font: "Arial", size: 20, color: "888888", italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 0 }
      }),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("VectorDB_Learning_Guide.docx", buffer);
  console.log("Done: VectorDB_Learning_Guide.docx");
});