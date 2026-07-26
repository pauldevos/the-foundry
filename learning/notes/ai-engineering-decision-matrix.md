# AI Engineering Decision Matrix — IF this signal → THEN this choice

*Built 2026-07-26, two days before Tuesday interviews. Same IF/THEN format as
`rag-pipeline/00-decision-tree.md`, extended past RAG specifically to the rest of the AI
engineering stack: documents, chunking, vector databases, deployment, tools/frameworks (in
both directions — requirement→tool and tool→"what's it for"), domain reverse-lookup,
compliance regimes, guardrails, retrieval, and reranking. Every category lists definitions
first, then a numbered IF/THEN list, each entry with a plain example. Purpose: train the
association both ways — hear a requirement, know the tool; hear a tool or domain, know
what it implies — for rapid-fire interview recall.*

---

## 0. 🧬 RAG Architecture Types

*Same content as `rag-pipeline/00-decision-tree.md`'s RAG-types section, duplicated here
on purpose so it's not missed while working in this file — definitions first, IF/THEN below.*

⚠️ **Don't conflate this with Section 2's chunking strategy.** "RAG type" describes the
overall pipeline's architecture/sophistication — a different axis entirely from chunking
strategy, which is one ingestion-stage choice inside *any* RAG type. Naive RAG typically
defaults to fixed-size chunking and Advanced RAG typically upgrades to semantic/
hierarchical — a rough tendency, not the definition. Naive RAG is defined by doing the bare
minimum end-to-end (no query rewriting, no hybrid search, no reranking), not by which
chunking method it happens to use.

**Definitions** (with 🗣️ how often this label is actually said aloud vs. just a survey-paper taxonomy term)
- **Naive RAG** (a.k.a. "Simple RAG"): the baseline two-phase pipeline — chunk, embed, store, retrieve top-k, stuff into the prompt, generate. No query rewriting, reranking, or metadata filtering. 🗣️ *High — genuinely said, almost always comparatively ("we started with naive RAG").*
- **Advanced RAG**: Naive RAG plus pre/post-retrieval refinements — query rewriting/HyDE, hybrid BM25+dense, self-query, reranking, better chunking. Not one technique — the label for "Naive RAG with the obvious improvements." 🗣️ *Low — nobody claims "we built Advanced RAG" specifically; people name the actual technique instead.*
- **Modular RAG**: not a technique — a framing that treats every pipeline stage as an independently swappable module. Every other type here is "Modular RAG with a specific module choice." 🗣️ *Near-zero — a framing term, not something anyone claims to have built.*
- **Graph RAG**: retrieval over a knowledge graph of entities/relationships instead of (or alongside) vector similarity — built for multi-hop, relational questions. 🗣️ *High — specific and common, thanks to Microsoft's actual GraphRAG project.*
- **Adaptive RAG**: a routing classifier before retrieval picks the strategy (or skips retrieval) per query, based on complexity. 🗣️ *Low — the behavior is common, the name isn't.*
- **Corrective RAG (CRAG)**: after retrieving, an external evaluator grades context quality; a poor grade triggers reformulation and re-retrieval (capped retries). 🗣️ *Medium — used by people who've read the paper; usually described by mechanism otherwise.*
- **Self-RAG**: the CRAG idea trained into the model's own weights via reflection tokens, instead of bolted on as external orchestration. 🗣️ *Low — requires actually fine-tuning reflection tokens in; mostly a research-reference point.*
- **Agentic RAG** (a.k.a. "Complex RAG"): a full autonomous agent loop — decides whether/when to retrieve, switches tools, rewrites queries between hops, checks its own faithfulness, re-retrieves on failure. Costs 3-10x the tokens, 2-5x the latency of Naive RAG. 🗣️ *Very high — actively driving real 2025-2026 design decisions, not just describing something in hindsight.*

**Calibration:** the techniques underneath these labels are the load-bearing interview
knowledge; the labels are mostly your own organizing scaffold, useful for answering "how
many types of RAG" as a direct trivia question, not vocabulary to reach for in a real
design conversation — nobody designs by picking a label off this list, they pick
techniques based on requirements (the IF/THEN entries here and throughout this file).

🎯 **What good actually sounds like** (the reference standard — say it this way, not
"we'd build an Advanced RAG"): *"I'd use vision/reasoning-model extraction, not classic
OCR, because the source has handwritten and tally-marked content OCR can't template-match.
Tables get pulled with a layout detector so they don't lose their structure. Citation is
mandatory because sourcing has to be verifiable. I need hybrid retrieval because the
identifiers are specific per year/policy and embeddings blur those together. And I want
self-query filtering because the policies are 99% textually similar and only change by a
small yearly rule — semantic similarity actually works against you there, so a metadata
filter is what actually separates them, not a better embedding model."* Every clause names
a concrete observation and the specific technique it implies — zero taxonomy labels, and
it's a stronger answer than any of the 8 types above.

**IF / THEN**

**1.** 🔎 **IF** you just need the retrieve-then-generate baseline...

✅ **THEN Naive RAG.**

**2.** 🔎 **IF** you need better precision on an otherwise-standard pipeline (query rewriting, reranking, better indexing)...

✅ **THEN Advanced RAG.**

**3.** 🔎 **IF** you want every pipeline stage independently swappable/configurable...

✅ **THEN Modular RAG** — a framing, not a standalone technique.

**4.** 🔎 **IF** the questions are relational/multi-hop across documents...

✅ **THEN Graph RAG.**

**5.** 🔎 **IF** query complexity varies and you want to route accordingly...

✅ **THEN Adaptive RAG.**

**6.** 🔎 **IF** you need retrieval-quality self-correction before answering, as external orchestration...

✅ **THEN Corrective RAG (CRAG).**

**7.** 🔎 **IF** you want that retrieve/critique behavior trained directly into the model's weights instead of orchestrated externally...

✅ **THEN Self-RAG.**

**8.** 🔎 **IF** stakes justify full autonomous multi-step reasoning, tool switching, and retries...

✅ **THEN Agentic RAG.**

---

## 1. 📄 Documents / Document AI

**Definitions**
- **Vector text (native/digital text)**: text stored as actual character data, not pixels — directly extractable without OCR.
- **Raster image / scanned document**: pixel data only, no embedded character data — requires OCR to become text at all.
- **Structured tabular data** (CSV, Excel, DB export): rows/columns with an explicit schema — not natural-language prose, shouldn't be chunked as text.
- **Semi-structured** (HTML, XML, JSON): markup/schema mixed with prose content.
- **OCR model**: recognizes characters from pixel images (Tesseract, RapidOCR, PaddleOCR, AWS Textract, Azure Document Intelligence, Mistral OCR) — outputs text (sometimes structure/bounding boxes too) but doesn't understand meaning.
- **Reasoning model** (used for extraction/synthesis): a general LLM, often an extended-thinking/o-series-style model, reading already-extracted text (or an image directly) to infer, compare, or synthesize — understands meaning, not just characters.
- **Multimodal / vision model**: takes an image directly as input and can describe or answer questions about its visual content (a chart, a diagram) without a separate OCR step.
- **Layout-aware parser**: preserves structural information (headings, tables, reading order) during extraction — a distinct concern from OCR itself (Docling, Azure DI's layout API, PPStructureV3).

**IF / THEN**

**1.** 🔎 **IF** the source is scanned/raster with no embedded text layer...

✅ **THEN** OCR is required — Textract/Azure DI for tables in a regulated document, RapidOCR/PaddleOCR for high-volume simple text. 💡 *Example:* a faxed prior-authorization form.

**2.** 🔎 **IF** the source is a digital-native PDF/DOCX with a real text layer...

✅ **THEN** skip OCR entirely, use direct layout-aware extraction (PyMuPDF, Docling). 💡 *Example:* running OCR on a Word-exported PDF wastes compute and can introduce errors extraction didn't have.

**3.** 🔎 **IF** the source is structured tabular data...

✅ **THEN** don't chunk it as prose — load into a structured store, let a SQL/DataFrame tool or query agent handle it directly. 💡 *Example:* a 5,000-row rebate schedule embedded as text chunks produces diluted, useless vectors.

**4.** 🔎 **IF** the source is HTML with navigation/boilerplate mixed into content...

✅ **THEN** use a boilerplate-stripping, layout-aware parser before chunking, not a raw-text dump. 💡 *Example:* scraping a state Medicaid formulary page — raw HTML-to-text drags in nav menus and footers as "content."

**5.** 🔎 **IF** the document contains a diagram/chart where the visual layout itself carries meaning...

✅ **THEN** use a multimodal/vision model to describe or reason over it directly — OCR would only grab text labels, losing the diagram's structure. 💡 *Example:* a pipeline engineering P&ID diagram.

**5b.** 🔎 **IF** the document has handwriting, tally marks, or other non-printed annotations...

✅ **THEN** classic OCR (template-matching against printed character shapes) is the wrong tool — reach for a multimodal/reasoning-capable model (or a dedicated handwriting mode, a separate capability from standard OCR in Textract/Azure DI) that infers characters from context and stroke pattern rather than matching a font glyph. 💡 *Example:* a scanned inspection form with hand-tallied counts — there's no consistent template for OCR to match, so it needs to be inferred, not recognized.

**6.** 🔎 **IF** the task is extracting known fields from a known/templated layout (a form)...

✅ **THEN** a cheaper, faster extraction-tuned tool beats a general reasoning model on cost and speed. 💡 *Example:* pulling an NPI number and diagnosis code off a standard prior-auth form.

**7.** 🔎 **IF** the task requires reasoning across extracted content (comparing, inferring, resolving ambiguity) rather than just pulling out what's literally there...

✅ **THEN** a reasoning-capable model has to be in the loop after extraction. 💡 *Example:* "does this clause conflict with section 4.2" requires reasoning across two retrieved clauses, not reading either alone.

**8.** 🔎 **IF** the corpus mixes many file types...

✅ **THEN** classify-then-route at ingestion — never one universal parser for a mixed corpus. 💡 *Example:* a PBM intake pipeline handling scanned faxes, digital PDFs, and Word docs at once.

---

## 2. ✂️ Chunking Strategy

**Definitions**
- **Fixed-size chunking**: split every N tokens/characters regardless of content boundaries — simplest, ignores structure.
- **Semantic chunking**: split at natural breakpoints detected via embedding similarity between adjacent sentences.
- **Hierarchical / structural chunking**: split along the document's own heading/section numbering.
- **Late chunking**: embed the full document first (so every token's representation carries document-level context), then split into chunks afterward.
- **Small-to-big / parent-document chunking**: index at a small granular unit, retrieve/return a larger parent unit at synthesis time.

**IF / THEN**

**1.** 🔎 **IF** the corpus has no reliable structure and is short-form (memos, FAQs)...

✅ **THEN** fixed-size or one-chunk-per-document is fine — nothing fancier is earning its complexity.

**2.** 🔎 **IF** a document has natural topic shifts but no reliable heading structure...

✅ **THEN** semantic chunking.

**3.** 🔎 **IF** the document has a clear numbered/heading hierarchy...

✅ **THEN** hierarchical/structural chunking off that hierarchy, not fixed-size.

**4.** 🔎 **IF** a chunk's embedding needs to "know about" the whole document (resolving a reference that only makes sense given earlier context)...

✅ **THEN** late chunking.

**5.** 🔎 **IF** the answer is one small clause but needs its surrounding section to be interpreted correctly...

✅ **THEN** small-to-big/parent-document chunking.

*(For which RAG retrieval technique or architecture type to pair with a chunking choice, see `rag-pipeline/00-decision-tree.md` — not duplicated here.)*

---

## 3. 🗄️ Vector Databases

**Definitions**
- **Pinecone**: fully-managed, cloud-only, proprietary — no self-hosted/on-prem option.
- **Qdrant**: open-source, self-hostable, strong filtered search and hybrid support, written in Rust.
- **Weaviate**: open-source, self-hostable, built-in hybrid search and a module ecosystem (including multimodal).
- **pgvector**: a Postgres extension adding vector similarity search to an existing Postgres database.
- **Chroma**: lightweight, easiest to spin up locally — a prototyping tool more than a production-scale store.
- **Milvus**: open-source, built for very large-scale vector search (billions of vectors), more operational complexity.
- **Databricks AI Search** (formerly Vector Search): managed hybrid search native to the lakehouse, auto-synced to Delta tables, governed by Unity Catalog.

**IF / THEN**

**1.** 🔎 **IF** PHI/strict data residency rules out sending data to a third-party managed cloud service...

✅ **THEN** Pinecone is off the table; self-hosted Qdrant/Weaviate or pgvector inside your own infrastructure.

**2.** 🔎 **IF** the team is already Postgres-native and doesn't need extreme scale or heavy hybrid-search tuning...

✅ **THEN** pgvector is the simplest, lowest-overhead path.

**3.** 🔎 **IF** you need production-grade hybrid search and fine-grained filtering from day one, self-hosted...

✅ **THEN** Qdrant or Weaviate.

**4.** 🔎 **IF** you're prototyping locally and want zero infra setup...

✅ **THEN** Chroma — plan to migrate before production scale.

**5.** 🔎 **IF** you need billions-of-vectors scale...

✅ **THEN** Milvus, accepting the higher operational complexity.

**6.** 🔎 **IF** the whole data stack is already on Databricks and you want retrieval auto-synced to Delta tables with Unity Catalog governance built in...

✅ **THEN** Databricks AI Search, accepting the platform lock-in.

---

## 4. 🚀 Deployment Patterns

**Definitions**
- **Blue-green deployment**: two full parallel environments; traffic cuts over all-at-once once the new one is validated, old one kept as instant rollback.
- **Canary deployment**: a small percentage of traffic routed to the new version first, gradually increased.
- **Shadow deployment**: the new version runs on real traffic in parallel, output never shown to users — only logged and compared.
- **Dual-index cutover** (blue-green applied to vector search specifically): build a full new index under a new embedding model in parallel, shadow-validate, cut over reads, decommission the old index.
- **On-prem deployment**: model/infrastructure runs entirely inside the customer's own network, nothing leaves.
- **Cloud/managed deployment**: runs on a vendor's cloud infrastructure, possibly inside a dedicated VPC.

**IF / THEN**

**1.** 🔎 **IF** you'll need to constantly re-evaluate or periodically swap the embedding model itself...

✅ **THEN** dual-index/blue-green cutover as a standing pattern — never a partial/gradual re-embed, which silently degrades retrieval when old- and new-model vectors mix in one index.

**2.** 🔎 **IF** you're rolling out a new retrieval strategy or reranker and want zero risk of it reaching real users before it's validated...

✅ **THEN** shadow deployment.

**3.** 🔎 **IF** you want gradual confidence-building with limited blast radius...

✅ **THEN** canary deployment.

**4.** 🔎 **IF** PHI/data must never leave a specific network boundary (a hospital's own data center, a government network)...

✅ **THEN** on-prem deployment, ruling out any cloud-hosted managed service regardless of that service's own compliance certifications.

**5.** 🔎 **IF** the actual requirement is "compliant with X," not "physically can't leave this network"...

✅ **THEN** cloud/managed deployment inside a compliant boundary (BAA-covered Bedrock/Vertex/Azure) is sufficient — on-prem isn't automatically required just because data is sensitive.

---

## 5. 🧰 Tools & Frameworks — Forward (IF need X → THEN tool)

**Definitions**
- **LangGraph**: graph-based agent orchestration — explicit nodes/edges define control flow; strong for complex, stateful, multi-step agents where you want fine-grained control over the exact path.
- **LlamaIndex**: data-framework-first, strongest abstractions specifically for RAG/indexing — often the fastest path to a working RAG pipeline.
- **AutoGen / Microsoft Agent Framework (MAF)**: conversation-centric multi-agent framework, agents "talk" to each other in a chat-like loop — strong Azure/enterprise ties.
- **CrewAI**: role-based multi-agent framework, simpler/higher-level abstraction than LangGraph, fast to prototype a multi-agent "crew."
- **Semantic Kernel**: Microsoft's enterprise-integration-focused SDK for embedding AI into existing .NET/enterprise apps.
- **Databricks Agent Bricks / Mosaic AI**: governed agent platform on Databricks — supports LangGraph/CrewAI/etc. as the "harness" underneath its own governance layer, not a replacement for picking one.

**IF / THEN**

**1.** 🔎 **IF** you need fine-grained, explicit control over a complex multi-step agent's control flow...

✅ **THEN** LangGraph.

**2.** 🔎 **IF** the core problem is "build a RAG pipeline fast" more than custom agent control flow...

✅ **THEN** LlamaIndex.

**3.** 🔎 **IF** the pattern is several agents conversing/collaborating, and you're already in an Azure/enterprise ecosystem...

✅ **THEN** AutoGen/MAF.

**4.** 🔎 **IF** you want a role-based multi-agent "team" fast, without LangGraph's low-level graph control...

✅ **THEN** CrewAI.

**5.** 🔎 **IF** you're embedding AI capability into an existing enterprise .NET application...

✅ **THEN** Semantic Kernel.

**6.** 🔎 **IF** the company's data/ML stack is on Databricks and you want governance (RBAC, tracing, memory) wrapped around whichever framework you picked above...

✅ **THEN** Agent Bricks running your existing graph inside it.

## 6. 🔄 Tools & Frameworks — Reverse (IF you hear the tool/context → THEN what it implies)

*Same information, inverted — hear the name first, produce the association.*

**1.** 🔎 **IF** you hear "**LangGraph**"...

✅ **THEN** think: graph-based, explicit control flow, complex stateful multi-step agents, high control / lower abstraction.

**2.** 🔎 **IF** you hear "**LlamaIndex**"...

✅ **THEN** think: RAG/indexing-first framework, many retriever/index types, fastest path to a working retrieval pipeline.

**3.** 🔎 **IF** you hear "**AutoGen**" or "**Microsoft Agent Framework**"...

✅ **THEN** think: conversation-centric multi-agent, Azure/enterprise ecosystem ties.

**4.** 🔎 **IF** you hear "**CrewAI**"...

✅ **THEN** think: role-based multi-agent teams, higher-level/simpler abstraction, fast prototyping.

**5.** 🔎 **IF** you hear "**using Azure**" as a stated constraint...

✅ **THEN** think: Azure OpenAI (BAA automatic via Microsoft's licensing DPA), AutoGen/Semantic Kernel as the natural framework fit, Azure AI Search or Cosmos DB for vector store.

**6.** 🔎 **IF** you hear "**RAG-heavy**" as a description of a role/system...

✅ **THEN** think: LlamaIndex or a custom hybrid-retrieval+reranking pipeline is likely central; less emphasis on complex multi-agent orchestration.

**7.** 🔎 **IF** you hear "**Databricks**"...

✅ **THEN** think: Agent Bricks/Mosaic AI, Unity Catalog governance, AI Search, Lakebase, MLflow 3 GenAI tracing.

**8.** 🔎 **IF** you hear "**AWS**"...

✅ **THEN** think: Bedrock (BAA-eligible, hosts Claude and others), OpenSearch for vector search, Textract for document parsing.

---

## 7. 🧭 Domain / Use-Case Reverse Reference

*Hear the domain, produce the architecture — no definitions needed, these are literal domains.*

**1.** 🔎 **IF** Legal documents (contracts)...

✅ **THEN** exact-match retrieval for clause/party terms (BM25), self-query by contract type/counterparty/date, mandatory citation to the exact contract version, dense retrieval for concept-level clauses ("force majeure") across differing phrasings.

**2.** 🔎 **IF** Pharma / drug coverage data...

✅ **THEN** hybrid BM25+dense for NDC/ICD-10/CPT exact codes, self-query for plan year and drug class, HIPAA/PHI governance stack, mandatory citations, confidence-threshold fallback given patient-safety stakes.

**3.** 🔎 **IF** HR policy documents...

✅ **THEN** don't assume tight latency — verify actual user tolerance; self-query by job level/location/business unit/plan year; recency-aware ranking (surface the current-year version); route ambiguous cases to HR rather than guess.

**4.** 🔎 **IF** NFL player biographies/stats...

✅ **THEN** BM25 non-negotiable for exact stats/records, dense for narrative bios, self-query for team/season/position, skip reranking (low stakes, high latency tolerance), GraphRAG interesting for relational stat questions.

**5.** 🔎 **IF** persona-consistent / digital-twin agents (a system that must consistently emulate a specific person's voice, knowledge, or personality across interactions)...

✅ **THEN** the challenge shifts from retrieval accuracy to consistency and grounding: a persona system prompt plus a retrieval corpus of that person's actual statements/writing (to ground responses in real material rather than invented voice), strict faithfulness checking to stop the model inventing in-character "facts" that aren't sourced, often a fine-tuned or heavily-prompted style layer on top of a standard RAG backend. ⚠️ *This one is my reasoned extrapolation, not a documented industry-standard pattern — sanity-check it matches what you actually meant.*

**6.** 🔎 **IF** Oil & gas / regulatory compliance...

✅ **THEN** exact section-number retrieval (BM25), self-query by jurisdiction/regulation-type/date, small-to-big for clause-level precision, GraphRAG for cross-jurisdiction permit dependencies, loose latency tolerance, route-to-licensed-engineer fallback.

**7.** 🔎 **IF** Financial services / regulatory...

✅ **THEN** exact regulation-number retrieval, effective-date metadata filtering, incremental per-document re-indexing as regulations update (not a full re-embed), citation mandatory.

---

## 8. 🔐 Data Residency & Compliance Regimes

**Definitions**
- **HIPAA**: US healthcare data privacy law; PHI is the protected category.
- **BAA**: contract required under HIPAA before sending PHI to a third-party service; attaches to a specific product surface, not a whole vendor.
- **PHI vs. PII**: PHI is the HIPAA-specific subset of PII where health context matters — a name alone isn't PHI, a name tied to a diagnosis is.
- **HITRUST**: a certification framework (CSF) that operationalizes HIPAA (and other regs) into an auditable control set — often what an enterprise healthcare customer actually asks a vendor to prove, beyond "we're HIPAA compliant."
- **ZDR (Zero Data Retention)**: an approval-gated arrangement where a vendor doesn't retain inputs/outputs beyond abuse prevention — separate from, and sometimes mutually exclusive with, BAA coverage.
- **GDPR**: EU data protection regulation — right to erasure, EU data residency, consent requirements; broader than HIPAA (all personal data, not just health).
- **SOC 2**: a general security/availability/confidentiality audit standard, not healthcare-specific.
- **FedRAMP**: US federal government cloud security authorization, required to sell to US federal agencies.

**IF / THEN**

**1.** 🔎 **IF** PHI will be sent to a third-party API/service...

✅ **THEN** a signed BAA covering that specific product surface is required first — verify actual coverage, not just "the vendor offers BAAs somewhere."

**2.** 🔎 **IF** an enterprise healthcare customer asks for a specific certification rather than just "HIPAA compliant"...

✅ **THEN** they likely mean HITRUST CSF — a more operational, auditable bar.

**3.** 🔎 **IF** the requirement is "the vendor should never retain our data at all"...

✅ **THEN** look for Zero Data Retention specifically — a BAA alone does not guarantee zero retention.

**4.** 🔎 **IF** the user base or data includes EU residents...

✅ **THEN** GDPR applies on top of/regardless of HIPAA — EU data residency and right-to-erasure are additional constraints HIPAA doesn't cover.

**5.** 🔎 **IF** the customer is general enterprise (not healthcare-specific) asking about security posture...

✅ **THEN** SOC 2 Type II is usually the baseline expectation, not HITRUST/HIPAA.

**6.** 🔎 **IF** the customer is a US federal agency...

✅ **THEN** FedRAMP authorization is required — a materially higher bar than commercial cloud compliance.

---

## 9. 🛡️ Guardrails

**Definitions**
- **Topic-scope enforcement**: a classifier/check blocking queries outside the system's intended domain before generation.
- **PHI/PII filter**: detects and masks/strips sensitive entities at input, context, and/or output.
- **Prompt injection defense**: detecting/neutralizing instructions embedded in untrusted content attempting to override system behavior.
- **Jailbreak detection**: detecting attempts to get the model to bypass its own safety/behavior constraints via adversarial phrasing.
- **Output validation / structured-output enforcement**: constraining and checking the model's output against an expected schema before it's used downstream.
- **Guardrails AI / NeMo Guardrails**: named open-source frameworks implementing several of the above as configurable checks.

**IF / THEN**

**1.** 🔎 **IF** the system must never answer outside a specific domain...

✅ **THEN** topic-scope enforcement as a fast pre-retrieval classifier.

**2.** 🔎 **IF** the corpus or user input may contain PHI/PII...

✅ **THEN** a PHI/PII filter at all three points — input, context, output (Presidio, AWS Comprehend Medical, Azure AI Language).

**3.** 🔎 **IF** the corpus includes user-uploaded or third-party documents (untrusted content)...

✅ **THEN** prompt injection defense at the chunk-sanitization step, not just a system-prompt instruction to "ignore embedded instructions."

**4.** 🔎 **IF** the system is public-facing and adversarial users are a real threat model...

✅ **THEN** jailbreak detection plus ongoing red-teaming (Promptfoo's attack-type suite), not a one-time check.

**5.** 🔎 **IF** downstream code/systems consume the model's output programmatically...

✅ **THEN** structured-output enforcement so malformed output fails loudly instead of breaking silently downstream.

---

## 10. 🔍 Retrieval (angles beyond the RAG-technique tree)

**1.** 🔎 **IF** the corpus's vocabulary is huge/specialized (heavy jargon, many synonyms/abbreviations for the same concept)...

✅ **THEN** SPLADE (learned sparse retrieval with vocabulary expansion) on top of BM25, not plain BM25 alone.

**2.** 🔎 **IF** query volume is enormous and latency must stay near-zero...

✅ **THEN** a lightweight bi-encoder for first-pass retrieval; save any heavier scoring for a much smaller candidate set, or skip it.

**3.** 🔎 **IF** the corpus changes constantly (new documents added continuously)...

✅ **THEN** favor an index type with cheap incremental updates (HNSW/managed services with good upsert support) over batch-rebuild-heavy index types.

**4.** 🔎 **IF** you need to combine multiple retrievers' ranked outputs into one list...

✅ **THEN** RRF (Reciprocal Rank Fusion) — sums 1/(k+rank) across lists, no need to normalize disparate score scales.

**5.** 🔎 **IF** retrieved results are too similar to each other (near-duplicates crowding out diverse relevant results)...

✅ **THEN** MMR (Maximal Marginal Relevance) to penalize redundancy.

---

## 11. 📊 Ranking / Reranking

**1.** 🔎 **IF** stakes and latency budget both justify 300ms+...

✅ **THEN** cross-encoder reranking on the top-k candidates.

**2.** 🔎 **IF** the latency budget is tight but some reranking value is still wanted...

✅ **THEN** a small/fast reranker (ms-marco-MiniLM) rather than a full cross-encoder, or skip entirely.

**3.** 🔎 **IF** the priority is recall, not precision...

✅ **THEN** skip reranking — it optimizes precision and can filter out true positives you need.

**4.** 🔎 **IF** results need diversity, not just relevance (avoid 5 near-identical chunks)...

✅ **THEN** MMR instead of, or alongside, a relevance-only reranker.

**5.** 🔎 **IF** merging multiple retrieval strategies' results...

✅ **THEN** RRF for score-agnostic fusion before or instead of a learned reranker.

---

## 12. ⚖️ Cross-Cutting Dimensions

*These four modify almost every decision above — re-apply them as a filter to whatever technique you're about to pick.*

**Definitions**
- **On-prem vs. cloud**: whether the model/infra runs inside a customer's own network boundary vs. a vendor's managed cloud.
- **Privacy / data residency**: whether data must stay within a specific geography or infrastructure boundary, regardless of who operates it.
- **Reasoning-model-or-not**: whether the task needs multi-step inference/reasoning (extended-thinking/o-series-style models) vs. simple extraction/classification.
- **Precision vs. recall**: whether missing a relevant result (recall) or returning an irrelevant one (precision) is the worse failure for this specific use case.

**IF / THEN**

**1.** 🔎 **IF** the constraint is "data physically cannot leave our network" (not just "must be compliant")...

✅ **THEN** on-prem deployment is required regardless of any cloud vendor's certifications.

**2.** 🔎 **IF** the constraint is "must be HIPAA/SOC 2/GDPR compliant" but not physically air-gapped...

✅ **THEN** a compliant cloud/managed deployment is sufficient — don't over-engineer to on-prem when it isn't required.

**3.** 🔎 **IF** the task requires multi-step inference (comparing multiple retrieved facts, resolving ambiguity, planning)...

✅ **THEN** a reasoning-capable model needs to be in the loop, at higher cost/latency.

**4.** 🔎 **IF** the task is single-step extraction/classification (pull this field, classify this document type)...

✅ **THEN** a cheaper, faster non-reasoning model is the right economic choice — a reasoning model here is wasted spend.

**5.** 🔎 **IF** missing a relevant result is worse than including some noise...

✅ **THEN** optimize for recall (wider k, multi-query, skip aggressive reranking).

**6.** 🔎 **IF** including an irrelevant/wrong result is worse than missing something...

✅ **THEN** optimize for precision (reranking, tighter k, hybrid exact-match).
