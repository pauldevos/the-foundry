# AI Director / Head of AI — Skills Frequency Map & Learning Repository
**Built from 35+ live job postings (July 2026) across Director of AI, Head of AI, Applied AI Director, Head of Data Science, Principal AI Engineer, AI Solutions Architect**

---

## PART 1: FREQUENCY MAP — What the Market Wants

Skills are ranked by how often they appeared across analyzed job postings. Postings included roles from: DataRobot, Loopio, JPMorgan, Deloitte, Cardinal Health, Cohere Health, Lyra Health, BeOne, Spring Health, Greenway Health, Asteri, GEICO, Ecolab, Bausch + Lomb, CACI, Optum, Eloquent AI, and 15+ others.

---

### 🔴 TIER 1 — CRITICAL (Appears in 85–100% of postings)
*If you can't speak confidently to these in an interview, you won't get offers.*

| Rank | Skill / Concept | Frequency | What Interviewers Want You to Know |
|------|----------------|-----------|-------------------------------------|
| 1 | **RAG Architecture** | ~95% | Full pipeline: chunking strategy, embedding models, vector stores, hybrid retrieval (BM25 + dense), reranking, eval harness |
| 2 | **Agentic AI / Multi-Agent Systems** | ~90% | Agent patterns (ReAct, planning, reflection, tool use), orchestration frameworks, stateful vs stateless agents |
| 3 | **LLM Evaluation (Evals)** | ~88% | Eval design, metrics (faithfulness, relevance, correctness, latency, cost), tools like RAGAS, TruLens, DeepEval, Promptfoo |
| 4 | **Python (production-grade)** | ~95% | Not just scripting — async, testing, packaging, CI/CD integration |
| 5 | **LLM Architecture & Tradeoffs** | ~85% | Transformer basics, context windows, token economics, model families (Claude, GPT, Llama, Gemini), when to use what |
| 6 | **Prompt Engineering** | ~85% | System prompts, chain-of-thought, few-shot, structured output, tool/function calling |
| 7 | **Production AI Deployment** | ~88% | Docker, CI/CD for AI systems, model serving, latency/reliability/cost tradeoffs |

---

### 🟠 TIER 2 — HIGH PRIORITY (Appears in 60–84% of postings)
*These are differentiators that separate "knows AI" from "leads AI".*

| Rank | Skill / Concept | Frequency | What Interviewers Want You to Know |
|------|----------------|-----------|-------------------------------------|
| 8 | **Fine-Tuning vs RAG Decision Framework** | ~80% | When RAG vs fine-tuning vs both; LoRA/QLoRA methods; PEFT; distillation use case |
| 9 | **AI Governance / Responsible AI** | ~78% | NIST AI RMF (Govern/Map/Measure/Manage), EU AI Act basics, ISO 42001, bias/fairness, guardrails |
| 10 | **MLOps / LLMOps** | ~75% | Model versioning, drift detection, observability, rollback, MLflow, monitoring pipelines |
| 11 | **Agent Orchestration Frameworks** | ~72% | LangGraph (dominant), CrewAI, AutoGen/MAF, LlamaIndex Workflows — tradeoffs between them |
| 12 | **Vector Databases** | ~70% | Pinecone, Qdrant, Weaviate, pgvector, FAISS; HNSW vs IVFFlat indexing; hybrid search |
| 13 | **MCP (Model Context Protocol)** | ~65% | Tool/resource definition, RBAC, enterprise integration, A2A protocol relationship |
| 14 | **AI Roadmap & Strategy** | ~70% | Translating business problems to AI use cases, build-vs-buy, vendor selection, ROI framing |
| 15 | **Stakeholder / Executive Communication** | ~75% | C-suite AI literacy programs, presenting technical roadmaps, non-technical translation |

---

### 🟡 TIER 3 — IMPORTANT (Appears in 35–59% of postings)
*Expected at Director level; not always tested in depth but must be conversational.*

| Rank | Skill / Concept | Frequency | What Interviewers Want You to Know |
|------|----------------|-----------|-------------------------------------|
| 16 | **Cloud AI Platforms** | ~55% | Azure ML / OpenAI, AWS Bedrock / SageMaker, GCP Vertex AI — service landscape, not deep expertise |
| 17 | **AI Safety & Guardrails** | ~55% | OWASP LLM Top 10, prompt injection defense, content filtering, confidence thresholds, fallback behaviors |
| 18 | **GraphRAG / Structured Retrieval** | ~40% | Knowledge graphs, SPARQL basics, when graph beats vector search |
| 19 | **Inference Cost Optimization** | ~45% | Model routing (Opus → Sonnet → Haiku), prompt caching, batching, cost-per-conversation modeling |
| 20 | **Observability / Tracing** | ~50% | LangSmith, Helicone, Arize, W&B traces — monitoring what the model does in production |
| 21 | **Data Platform / Lakehouse** | ~50% | Databricks Medallion architecture, Delta Lake, Spark for AI pipelines |
| 22 | **A2A Protocol** | ~40% | Agent-to-agent communication, Agent Cards, delegating across agent networks |
| 23 | **Team Building / Org Design** | ~55% | Hiring AI talent, building AI CoE, setting standards, mentoring |
| 24 | **Cross-Functional Leadership** | ~60% | Aligning engineering, product, data, infosec, legal on AI initiatives |
| 25 | **AI Use Case Discovery** | ~55% | Running AI opportunity assessments, feasibility analysis, prioritization frameworks |

---

### 🟢 TIER 4 — GOOD TO HAVE (Appears in <35% of postings)
*Helpful for specific roles or industries; not expected at every interview.*

| Skill | Notes |
|-------|-------|
| Fine-tuning from scratch / RLHF | Mostly research or product ML roles, not typical Director scope |
| Snowflake Cortex AI | Only for Snowflake-ecosystem roles |
| Knowledge Graphs / SPARQL | GEICO, finance, and regulated data-heavy roles |
| EU AI Act deep expertise | Increasingly relevant for compliance-heavy orgs |
| Computer use / multimodal agents | Emerging — Anthropic, frontier companies |
| Speech-to-text pipeline design | Relevant given your IBM call center work |
| LLM Red Teaming / Jailbreak Testing | Evals-adjacent; good bonus signal |
| ISO 42001 | AI Management Systems standard, useful in gov/healthcare |
| Streamlit / Gradio | Prototyping and demo-building for stakeholders |

---

## PART 2: THE DECISION FRAMEWORKS YOU MUST MASTER
*These come up in every technical interview at Director level as "tell me how you'd approach..." questions.*

### Decision Framework 1: RAG vs Fine-Tuning vs Both
**The core rule (2026):**
- **RAG** → when knowledge changes, needs sources/citations, data privacy matters, ship fast
- **Fine-tuning** → when behavior needs to change (tone, format, classification), not facts; use LoRA/QLoRA
- **Both** → RAG for knowledge retrieval + fine-tuning for consistent output format/style
- **Context-first** → If knowledge base is small enough, try prompt caching + full context before RAG

**Key interview answer:** *"Put volatile knowledge in retrieval, put stable behavior in fine-tuning."*

### Decision Framework 2: LLM Model Selection Tradeoffs
- Capability tiers: frontier (Claude Opus, GPT-4o, Gemini 2.5 Pro) vs. mid (Claude Sonnet, GPT-4o-mini) vs. small/fast (Claude Haiku, Llama 3.x)
- Model routing: use fast/cheap models for classification/routing, expensive for synthesis
- Open-weight vs. proprietary: data residency, latency, cost, customization tradeoffs
- Context window: implications for RAG chunk size, conversation design, cost

### Decision Framework 3: Agentic Architecture Patterns
- **ReAct** (Reason + Act): chain thought with tool calls
- **Planning agents**: decompose goal → subgoals → execute
- **Reflection agents**: self-critique and iterate
- **Multi-agent**: Supervisor pattern (central coordinator) vs Peer pattern (equals) vs Hierarchical
- **Frameworks**: LangGraph (stateful, production-grade), CrewAI (rapid prototyping), AutoGen/MAF (Microsoft ecosystem)

### Decision Framework 4: Eval Design
- What to measure: correctness, faithfulness (not hallucinating), context relevance, answer relevance, latency, cost
- Eval types: unit evals (single LLM call), integration evals (full pipeline), regression evals (detect drift)
- Tools: RAGAS, TruLens, DeepEval, Promptfoo, Inspect, LangSmith
- **Interview signal:** *"Can you walk me through an eval you actually designed?"* — this is the #1 question to prepare

### Decision Framework 5: Build vs Buy vs Partner (AI Strategy)
- Foundation models: when to call API vs host open-weight
- Orchestration: LangGraph/CrewAI vs managed platform (LangChain Cloud, Azure AI Foundry, AWS Bedrock Agents)
- Vector stores: managed (Pinecone, Weaviate Cloud) vs self-hosted (pgvector, Qdrant OSS)
- Eval tooling: open-source (RAGAS) vs managed (Braintrust, Arize)

---

## PART 3: LEARNING REPOSITORY — Resources by Topic

### 🎓 FORMAL COURSES (Best for interview depth)

| Course | Source | What It Covers | URL/Location |
|--------|--------|----------------|--------------|
| CS 224G: Building & Scaling LLM Applications | Stanford (2026) | Reasoning models, agentic workflows, RAG, responsible AI | web.stanford.edu/class/cs224g |
| CS 329T: Building & Evaluating Agentic AI | Stanford (Fall 2025) | Eval design, RAG triad, agentic systems, fine-tuning | web.stanford.edu/class/cs329t |
| CS 230: Deep Learning (Agents, Prompts, RAG) | Stanford (Autumn 2025) | Agents, prompts, RAG fundamentals | youtube.com/watch?v=k1njvbBmfsw |
| DeepLearning.AI: LangChain for LLM App Dev | DeepLearning.AI | LangChain, RAG, agents, evaluation | deeplearning.ai |
| DeepLearning.AI: Building Agentic RAG | DeepLearning.AI | Advanced RAG patterns, agentic retrieval | deeplearning.ai |
| DeepLearning.AI: LLM Fine-Tuning (PEFT/LoRA) | DeepLearning.AI | Fine-tuning, LoRA, QLoRA, Hugging Face | deeplearning.ai |
| Complete Agentic AI Course (10 hrs) | YouTube | LangChain, LangGraph, RAG, Guardrails, Evals | youtube.com/watch?v=rV3HJ4LEZ7k |

---

### 📺 YOUTUBE CHANNELS (Best for staying current)

| Channel | Focus | Best Playlist/Video to Start |
|---------|-------|------------------------------|
| **LangChain** | LangGraph, agents, RAG evaluation | "LangGraph for agents" playlist |
| **AssemblyAI** | LLM evals, function calling, voice agents, RAG | "LLM evaluation" series |
| **AI Jason** | Production agentic apps, multi-agent workflows | "LangChain Multi-Agent tutorials" |
| **Andrej Karpathy** | LLM architecture from scratch, tokenization | "Let's build GPT from scratch" |
| **Stanford Online** | Formal lectures, ML, GenAI, NLP | CS224G / CS229 lecture series |
| **Analytics Vidhya** | Practical GenAI, RAG, fine-tuning | LlamaIndex RAG series |
| **Sam Witteveen** | Agents, Gemini, LangGraph, prompt engineering | Multi-agent tutorials |
| **Matt Williams** | Ollama, local LLMs, RAG implementation | Local LLM deployment series |

---

### 📄 BLOGS, PAPERS & REFERENCE MATERIALS

#### RAG Architecture
- **"RAG vs Fine-Tuning 2026 Decision Framework"** — winder.ai (excellent production-focused guide)
- **"RAG-first, tune-second default"** — umesh-malik.com (covers hybrid retrieval + reranking)
- **Databricks Blog: LLM Fine-Tuning** — databricks.com/blog/llm-fine-tuning (covers full lifecycle)
- **"A Practical Guide to LLM Fine Tuning"** — Databricks (LoRA, QLoRA, catastrophic forgetting)

#### Agentic AI / Orchestration
- **Stanford CS 224G Lecture 7: Agent Orchestration & Workflow Design** — web.stanford.edu/class/cs224g (covers LangGraph vs CrewAI, MCP, A2A, state management, safety)
- **"Multi-Agent Orchestration Platforms: Build vs Buy 2026"** — augmentcode.com (LangGraph, CrewAI, AutoGen, MAF comparison)
- **"MCP vs A2A vs ACP: Complete Guide 2026"** — aimagicx.com (protocol stack, enterprise patterns)
- **"State of Agentic AI Standards 2026"** — amdatalakehouse.substack.com (MCP, A2A production state)
- **"Latest AI Agent Frameworks 2026: Ranked"** — ampcome.com (LangGraph, CrewAI, LlamaIndex, MAF)

#### LLM Evals
- **"AI Developer Hiring 2026: Skills That Actually Matter"** — digitalapplied.com (has the exact eval questions interviewers ask)
- **"AI Evals Engineer: Career Guide 2026"** — jobsbyculture.com (eval discipline overview, tools)
- **"LLM Evaluation Guide 2026"** — (search for Inspect, Promptfoo, RAGAS official docs)
- **RAGAS docs** — docs.ragas.io (framework for RAG evaluation)
- **TruLens docs** — trulens.org (another eval framework)

#### AI Governance
- **NIST AI RMF** — nist.gov/itl/ai-risk-management-framework (the source — Govern/Map/Measure/Manage)
- **"AI Governance Careers 2026"** — techjacksolutions.com (NIST RMF + ISO 42001 + EU AI Act overview)
- **"AI Risk Manager Guide 2026"** — techjacksolutions.com/careers/ai-careers/ai-risk-manager
- **"AI GRC Roles in the US"** — blog.execsearches.com/ai-grc-governance-roles-us

#### Inference Cost / Model Routing
- **"AI Developer Hiring 2026"** — digitalapplied.com (has the "cost per conversation" interview question)
- **Anthropic Cost Calculator** — anthropic.com (prompt caching, input/output pricing)

---

### 🔬 SPECIFIC TOPICS TO STUDY (mapped to interview questions)

#### Topic 1: RAG Pipeline Deep Dive
**What to know:** Chunking strategies (semantic vs fixed vs hierarchical), embedding models (text-embedding-3-large, bge-large, Cohere embed-v3), vector indexing (HNSW vs IVFFlat), hybrid search (BM25 + vector + RRF fusion), reranking (Cohere Rerank, cross-encoders), eval metrics (precision@k, recall@k, faithfulness, answer relevance)

**Interview question you'll get:** *"Walk me through how you'd build a RAG system for a regulated healthcare environment."*

**Your answer hook:** IBM hybrid RAG for regulatory compliance (BM25 + dense + Reciprocal Rank Fusion)

#### Topic 2: LLM Tradeoffs & Architecture
**What to know:** Transformer architecture (attention, context window), token economics, how model families differ (Claude's long context, GPT-4o speed, Llama open-weight), when frontier vs. distilled small model, streaming vs batch

**Interview question you'll get:** *"How do you decide which LLM to use for a given use case?"*

**Your answer hook:** JPMorgan-style — use routing (cheap/fast for classification, expensive for synthesis), cost model per query, latency SLA

#### Topic 3: Eval Framework Design
**What to know:** What to measure (correctness, faithfulness, context relevance, answer relevance, latency, cost), unit vs integration vs regression evals, synthetic dataset generation, human-in-the-loop evals, tools (RAGAS, TruLens, DeepEval)

**Interview question you'll get:** *"How do you know if your AI system is actually working in production?"*

**Your answer hook:** Your MCP server audit logging + token spend governance = you already built an observability layer

#### Topic 4: Agentic System Design
**What to know:** Single agent vs multi-agent tradeoffs, orchestration patterns (supervisor, peer, hierarchical), tool use and function calling, state management, fallback behaviors, safety/containment

**Interview question you'll get:** *"Design a multi-agent system for [use case they care about]."*

**Your answer hook:** Your enterprise MCP server with RBAC/SSO/PHI scrubbing is a real governance control plane for agents

#### Topic 5: AI Governance & Responsible AI
**What to know:** NIST AI RMF four functions (Govern, Map, Measure, Manage), bias/fairness testing, OWASP LLM Top 10, prompt injection defenses, model risk management, EU AI Act risk tiers

**Interview question you'll get:** *"How do you govern AI at the enterprise level?"*

**Your answer hook:** Your MCP server already implements audit logging, identity observability, PHI/PII scrubbing = real governance artifact

#### Topic 6: Fine-Tuning Decision & Methods
**What to know:** When fine-tuning beats RAG (behavior, not facts), LoRA vs QLoRA vs full fine-tuning, PEFT methods, DPO/ORPO for alignment, distillation use case (frontier → small model), catastrophic forgetting

**Interview question you'll get:** *"When would you fine-tune vs use RAG, and what method would you use?"*

---

## PART 4: PAUL-SPECIFIC GAP ANALYSIS

Based on job frequency vs. your confirmed experience:

### ✅ STRONG (Use as proof points in interviews)
- RAG architecture (hybrid BM25 + dense + RRF — you built this at IBM)
- Production AI deployment (32-model forecasting system, global food service platform)
- MCP / agentic architecture (enterprise production MCP server with RBAC/SSO/PHI scrubbing)
- Enterprise stakeholder alignment / cross-functional leadership (IBM consulting model)
- AI enablement / org-wide rollout (400 employees in 30 days)
- Inference cost governance (token spend governance in your MCP server)
- Responsible AI governance (audit logging, PHI scrubbing, identity observability)

### 🔶 BUILD/STRENGTHEN (1–4 weeks)
- **LLM Evals** — RAGAS/TruLens hands-on; design and run an eval harness on your RAG system
- **LangGraph** — Build a stateful multi-agent workflow with LangGraph; this is the most-cited framework
- **Vector store benchmarking** — Know tradeoffs: pgvector vs Qdrant vs Pinecone by use case
- **NIST AI RMF** — Map your MCP server project to the four functions for a governance narrative

### 📚 STUDY FOR CONVERSATIONAL FLUENCY (not hands-on required)
- Fine-tuning methods (LoRA, QLoRA, DPO) — know when to recommend, not necessarily build
- EU AI Act risk tiers — helpful for regulated industry roles
- A2A protocol — understand the architecture even if you haven't implemented it
- Agentic patterns vocabulary (ReAct, reflection, planning, supervisor) — label what you've done

---

## PART 5: INTERVIEW PREPARATION FRAMEWORK

### The "5 Stories" You Need Ready
Every Director-level AI interview will eventually ask one of five things. Have a crisp story for each:

1. **"Tell me about an AI system you built and put into production."**
   → IBM 32-model natural gas forecasting or global food service AI platform

2. **"Walk me through your approach to RAG."**
   → IBM hybrid RAG regulatory compliance system (BM25 + dense + RRF + guardrails)

3. **"How do you govern AI at the enterprise level?"**
   → RxSense MCP server: RBAC, SSO, PHI/PII scrubbing, audit logging, token spend governance

4. **"How do you decide which LLM to use?"**
   → Model routing framework: capability tier → cost model → latency SLA → data residency → fine-tune vs RAG decision

5. **"Tell me about a time you influenced a non-technical executive on an AI decision."**
   → IBM client-facing solutioning pattern: C-suite + data + engineering + infosec alignment

---

*Document compiled July 2026 from 35+ live job postings and current market research.*
*Sources: Indeed, LinkedIn, Builtin, DataRobot, Deloitte, JPMorgan job postings; Stanford CS224G/CS329T syllabi; digitalapplied.com 2026 AI hiring data; NIST AI RMF official site.*
