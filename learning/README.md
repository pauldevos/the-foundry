# Learning Content

Three content types, kept in separate folders:

- **`decks/`** — flashcard JSON. Broad topic decks at top level; deep-dive domain
  decks (e.g. RAG pipeline layers) in `decks/<domain>/`.
- **`notes/`** — long-form "read repeatedly until you can narrate it" reference docs.
  Same top-level/domain-subfolder split as decks.
- **`talk-tracks/`** — one file per domain, short interview-ready talking points
  (Director + Principal/Staff registers going forward).

See also: [glossary.md](glossary.md), [QUEUE.md](QUEUE.md), [WATCH_GUIDE.md](WATCH_GUIDE.md).

**Totals: 283 cards (157 starred) across 23 decks. 21 notes files. 1 talk-track files.**

## Decks

- [Agentic Evals — Arize Workshop](decks/agentic-evals-arize-cards.json) — Tier 1 · LLM Evaluation + Agentic AI · 11 cards (8 starred)
- [Agentic AI / Multi-Agent Systems](decks/agentic-multi-agent.json) — Tier 1 · ~90% of postings · 10 cards (4 starred)
- [AI Roadmap & Strategy](decks/ai-roadmap-strategy.json) — Tier 2 · ~70% of postings · 8 cards (5 starred)
- [Claude & OpenAI APIs](decks/claude-openai-apis.json) — Tool deep-dive · underlies Prompt Engineering + Production Deployment (Tier 1) · 10 cards (4 starred)
- [CME 295 L6 — Reasoning Models & GRPO](decks/cme295-l6-reasoning-cards.json) — Tier 1 · LLM Architecture & Tradeoffs (~85%) · 10 cards (5 starred)
- [CME 295 L7 — Tool Calling & ReAct Mechanics](decks/cme295-l7-tools-agents-cards.json) — Tier 1 · ~90% of postings · 13 cards (7 starred)
- [CME 295 L8 — Evals: Measurement Theory & Bias Taxonomy](decks/cme295-l8-evals-cards.json) — Tier 1 · ~88% of postings · 16 cards (9 starred)
- [Evals — Process & Methodology](decks/evals-process.json) — Tier 1 · ~88% of postings · 7 cards (3 starred)
- [Fine-Tuning vs. RAG Decision Framework](decks/fine-tuning-vs-rag.json) — Tier 2 · ~80% of postings · 10 cards (6 starred)
- [GitHub Copilot — Real-World Evals](decks/github-copilot-evals-cards.json) — Tier 1 · LLM Evaluation (~88%) · 10 cards (6 starred)
- [Inspect — Eval Framework](decks/inspect-framework-cards.json) — Tier 1 · LLM Evaluation (~88%) · 9 cards (3 starred)
- [LlamaIndex — Framework & Platform](decks/llamaindex.json) — Tool deep-dive · maps to RAG (Tier 1) + Document AI strength area · 10 cards (4 starred)
- [LLM Architecture & Tradeoffs](decks/llm-architecture.json) — Tier 1 · ~85% of postings · 10 cards (5 starred)
- [LLM Evaluation Frameworks](decks/llm-evaluation-frameworks.json) — Tier 1 · ~88% of postings · 10 cards (5 starred)
- [MCP, A2A & Agent Governance](decks/mcp-a2a-governance.json) — Tier 2 · MCP ~65%, Governance ~78% · 10 cards (5 starred)
- [MLOps / LLMOps](decks/mlops-llmops.json) — Tier 2 · ~75% of postings · 10 cards (6 starred)
- [Production AI Deployment](decks/production-ai-deployment.json) — Tier 1 · ~88% of postings · 10 cards (5 starred)
- [Prompt Engineering](decks/prompt-engineering.json) — Tier 1 · ~85% of postings · 10 cards (6 starred)
- [RAG Architecture](decks/rag-architecture.json) — Tier 1 · ~95% of postings · 48 cards (22 starred)
- [RAG From Scratch — Routing, Proposition Indexing & RAPTOR](decks/rag-from-scratch-cards.json) — Tier 1 · RAG Architecture (~95%) · 9 cards (6 starred)
- [Retrieval Algorithms — BM25, SPLADE, BM42, Bi-encoder vs Cross-encoder](decks/rag-pipeline/04-retrieval.json) — Tier 1-2 · Retrieval Pipeline (Layer 4) · 15 cards (10 starred)
- [Layer 5: Generation + Governance](decks/rag-pipeline/05-governance.json) — Tier 1-2 · Director Level · 17 cards (17 starred)
- [Vector Databases](decks/vector-databases.json) — Tier 2 · ~70% of postings · 10 cards (6 starred)

## Notes

- [notes/ai-engineering-decision-matrix.md](notes/ai-engineering-decision-matrix.md) — IF/THEN reference across the whole AI engineering stack: documents, chunking, vector DBs, deployment, tools (forward + reverse), domain reverse-lookup, compliance regimes, guardrails, retrieval, reranking, cross-cutting dimensions
- [notes/databricks-ai-platform-2026-update.md](notes/databricks-ai-platform-2026-update.md) — interview cram sheet: what's new in Databricks' AI/ML platform mid-2025 to July 2026 (Agent Bricks, Unity AI Gateway, MLflow 3 GenAI, AI Search, Lakebase), each tied back to RAG/agentic alternatives Paul already knows
- [notes/lecture-notes-cme295-l1.md](notes/lecture-notes-cme295-l1.md)
- [notes/lecture-notes-cme295-l6.md](notes/lecture-notes-cme295-l6.md)
- [notes/lecture-notes-cme295-l7.md](notes/lecture-notes-cme295-l7.md)
- [notes/lecture-notes-cme295-l8.md](notes/lecture-notes-cme295-l8.md)
- [notes/notes-agentic-evals-arize.md](notes/notes-agentic-evals-arize.md)
- [notes/notes-github-copilot-evals.md](notes/notes-github-copilot-evals.md)
- [notes/notes-inspect-eval-framework.md](notes/notes-inspect-eval-framework.md)
- [notes/notes-jerry-liu-rag.md](notes/notes-jerry-liu-rag.md)
- [notes/notes-llm-evals-common-mistakes.md](notes/notes-llm-evals-common-mistakes.md)
- [notes/notes-llm-evals-video-topic-map.md](notes/notes-llm-evals-video-topic-map.md) — deduplicated topic index across 13 eval videos (methodology, judge validation, synthetic data, agent-assisted evals, annotation tooling, LangSmith/Braintrust/Phoenix comparison), each point cross-linked to every video/timestamp where it's covered
- [notes/notes-ocr-text-vs-image-grounding.md](notes/notes-ocr-text-vs-image-grounding.md)
- [notes/notes-rag-from-scratch-langchain.md](notes/notes-rag-from-scratch-langchain.md)
- [notes/rag-pipeline/00-quick-reference.md](notes/rag-pipeline/00-quick-reference.md) — ranked cram sheet: what each RAG technique is, when to use it, when not to
- [notes/rag-pipeline/00-decision-tree.md](notes/rag-pipeline/00-decision-tree.md) — flat IF/THEN reference mapping requirement signals (citation need, recall vs. precision, latency, compliance) to the right technique or RAG architecture
- [notes/rag-pipeline/00b-build-process-playbook.md](notes/rag-pipeline/00b-build-process-playbook.md) — 6-step process for architecting a RAG chatbot cold, plus a tradeoffs table across every use case in the talk-tracks
- [notes/rag-pipeline/00c-worked-code-example.md](notes/rag-pipeline/00c-worked-code-example.md) — one complete stage-by-stage code walkthrough (self-query schema, hybrid retrieval, prompt sections, guardrails) using the PBM formulary use case
- [notes/rag-pipeline/00d-problem-taxonomy.md](notes/rag-pipeline/00d-problem-taxonomy.md) — 8 named problem classes (perception, structural parsing, precision/citation, recency/supersession, jurisdiction, cross-document, faithfulness/abstention, privacy/governance) that replace "agentic RAG" with falsifiable technical vocabulary, applied across 8 domains (clinical claims, drug labels, research papers, oil & gas, historical archives, banking, energy field records, family law)
- [notes/rag-pipeline/01-ingestion-parsing/benchmarks.md](notes/rag-pipeline/01-ingestion-parsing/benchmarks.md)
- [notes/rag-pipeline/01-ingestion-parsing/cloud-setup-notes.md](notes/rag-pipeline/01-ingestion-parsing/cloud-setup-notes.md)
- [notes/rag-pipeline/01-ingestion-parsing/tools-survey.md](notes/rag-pipeline/01-ingestion-parsing/tools-survey.md)
- [notes/rag-pipeline/01-ingestion-parsing/ocr-tool-deep-dive.md](notes/rag-pipeline/01-ingestion-parsing/ocr-tool-deep-dive.md) — ~28 OCR/Document-AI tools re-sliced into 3 tables (architecture class & training data, deployment/install/license, fine-tuning feasibility), the verified olmOCR→RolmOCR fine-tune lineage as a reusable domain-adaptation template, and a sourced fact-check of a pasted r/LocalLLaMA PaddleOCR-VL/Marker/PP-StructureV3 benchmark
- [notes/rag-pipeline/02-chunking-metadata/tools-survey.md](notes/rag-pipeline/02-chunking-metadata/tools-survey.md)
- [notes/rag-pipeline/04-retrieval.md](notes/rag-pipeline/04-retrieval.md)
- [notes/rag-pipeline/05-governance.md](notes/rag-pipeline/05-governance.md)
- [notes/rag-pipeline/portfolio-projects.md](notes/rag-pipeline/portfolio-projects.md)

## Talk Tracks

- [talk-tracks/rag-pipeline.md](talk-tracks/rag-pipeline.md)
