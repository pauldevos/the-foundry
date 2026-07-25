# Interview Talk Tracks — RAG Pipeline
*These are polished, interview-ready phrasings. Learn the concepts, then riff from these anchors.*
*Updated: 2026-07-25 — Session 1 (All 5 Layers complete, 2026-07-22) + Q&A correction pass (compliance/BAA landscape, MTEB pharma-specificity, exact-match/dual-index/citation mechanisms, small-to-big clause anecdote, HR latency correction, financial-services re-index scope)*

---

## Layer 1: Document Ingestion & Parsing

### On file type diversity and tool selection
> "The first question I always ask is: what kinds of documents are we dealing with, and what state are they in? With a mixed corpus — scanned PDFs, digital PDFs, Word docs, HTML — you can't use a single extraction tool. I'd classify documents by type first, then route each to the appropriate parser. For scanned documents in a healthcare setting, I'd use AWS Textract or Azure Document Intelligence — they're table-aware and return structured output with bounding boxes, not just raw text. Digital PDFs get layout-aware extraction to preserve heading hierarchy and table structure. The library you use matters: PyMuPDF is fast and free, excellent for clean digital PDFs; Docling (IBM open source) handles complex clinical layouts and outputs clean markdown."

### On OCR tool choice (when challenged)
> "The right OCR tool depends on the document type and your operational constraints. For high-volume simple text — memos, clean typed pages — RapidOCR or PaddleOCR are fast and free. For complex layouts with tables and forms in a regulated industry, I'd use Textract or Azure DI — the extra cost buys you structured output with table cell coordinates, which is critical downstream. For academic or technical documents, Mistral OCR has been strong in recent benchmarks. I wouldn't use Tesseract for anything production-grade — it struggles badly with tables and non-standard layouts."

### On metadata extraction — the domain-awareness gap
> "Most tools extract some structural metadata automatically — Azure Document Intelligence will pull page counts, document language, detected form fields. But that's generic metadata. What's actually valuable for retrieval is domain-aware metadata: effective date, document type, policy ID, clinical category, version number. No tool gives you that out of the box because it requires understanding your specific domain's semantics. So I build a lightweight metadata extraction step after parsing — typically a structured LLM call that reads the first page and outputs JSON with the domain-specific fields I need. I think of this as building the document manifest: you extract it once at ingestion time, and it powers filtered retrieval on every future query for free."

> "The example that makes this concrete: a provider asking 'what's our GLP-1 coverage policy?' against a 15-year archive without metadata filtering might return 2011 documents alongside current ones — embeddings don't reliably distinguish 2021 from 2022 by semantic content alone. The fix is structural: extract 'effective_date' at ingestion, apply a date filter at retrieval time."

### On tables in chunking
> "Tables are first-class objects in my ingestion pipeline — I don't let them get mangled by generic text chunking. I use layout detection during parsing (PPStructureV3 from PaddleOCR, or Azure DI's table API) to identify them, then apply a table-specific strategy. For tables that are effectively the answer — formularies, drug dosage tables, fee schedules — they become standalone chunks with a synthetic text header I generate: 'Table: GLP-1 coverage tiers by plan type, effective 2024.' For small reference tables embedded in prose, I keep them with their surrounding paragraph. For very large data tables (100+ rows), I don't embed them at all — I extract them to a structured store and let a query agent handle them."

---

## Layer 2: Chunking

### On embedding token limits (Problem 1)
> "Most embedding models have a max input of 512 to 8,000 tokens. A 300-page clinical guideline is roughly 150,000 tokens. You physically cannot embed it as a single unit — chunking is a hard technical constraint, not a design preference."

### On retrieval precision degradation (Problem 2)
> "Large chunks hurt retrieval precision in a specific way: an embedding is effectively an average over all the content in the chunk. If a single chunk spans cardiovascular medications and dosing protocols, the embedding is a blended signal — a query about dosing might not surface it precisely because the cardiovascular content pulls the vector in a different direction. The fix isn't 'smaller is always better' — it's match chunk size to the typical query scope."

### On document-type-specific chunking
> "I don't use a single chunking strategy across a heterogeneous corpus. Short documents like memos are often best treated as single chunks. Long structured documents like clinical guidelines get hierarchical chunking — I use the document's own heading structure as natural chunk boundaries, then apply small-to-big retrieval: embed at the section level for precise matching, return the parent chapter at synthesis time so the LLM has enough context."

### On small-to-big / parent-document retrieval — what "parent" actually means
> "Small-to-big retrieval is the pattern for a long, deeply-structured document where the answer lives in one specific clause but that clause is meaningless without its surrounding section. I embed and index at the leaf level — aligned to the document's own numbered heading hierarchy, so a specific subsection is its own chunk — because that's what gives embedding precision. But each leaf chunk carries a pointer to its parent section. At retrieval time I match on the leaf, then fetch and return the immediate parent section for synthesis — not the whole document. A 20-page regulatory document doesn't need to be dumped into context to correctly answer a question about one clause inside it; you need the leaf match's precision and just enough surrounding structure — typically the containing section, occasionally a full chapter — to not misinterpret it. The mistake I'd flag in an interview is conflating 'small-to-big' with 'retrieve small, then hand the model the entire source document' — that defeats the point of chunking in the first place and reintroduces the same blended-signal problem hierarchical chunking was solving."

*[Personal: this is exactly the retrieval shape our midstream oil & gas pipeline compliance program needed — index matches would land on a specific policy clause (e.g. 12.3.5) inside a single document that ran longer than 20 pages, and the correct answer required splicing back to the containing section, not the whole document, to give the compliance engineer usable context.]*

---

## Layer 3: Indexing

### On embedding model selection — the MTEB trap
> "I don't pick an embedding model from the MTEB leaderboard. MTEB is measured on general benchmarks. Embedding quality is domain-specific — a model that ranks #1 on MTEB may underperform a mid-tier model on your clinical corpus. And even MTEB's domain-labeled tasks don't save you: its 'medical' retrieval tasks are literature-QA-shaped — PubMed-style question answering — not formulary-coverage-policy or drug-label language. A model ranking well there tells you almost nothing about how it'll rank pharma coverage-policy chunks versus general healthcare-advice content. I benchmark on a representative sample of my own data before committing to a model, full stop."

### On data residency and compliance — lead with this in regulated industries
> "The first constraint for embedding model selection in a regulated environment isn't capability — it's data residency and compliance. In healthcare with PHI, I can't send document text to a third-party embedding API without a Business Associate Agreement. That immediately narrows the field: Azure OpenAI offers a HIPAA BAA and hosts OpenAI embedding models in your tenant. Self-hosted open-source models like bge-large or E5-large are the other path — nothing leaves your infrastructure. This is often the decision that picks the model for you before you even look at quality benchmarks."

*[Personal anchor: At Neudesic/IBM as an Azure OpenAI partner — defaulted to text-embedding-3-large unless a client directed otherwise. Right call for Azure-first shops with a BAA.]*

### On which Claude/LLM access paths are actually HIPAA-eligible — the trap candidates fall into
> "There's a common mistake I watch for: assuming any access to a frontier model is HIPAA-safe because the vendor 'does' BAAs. The BAA attaches to a specific product surface, not the model itself. For Claude specifically: Azure OpenAI's BAA comes automatically through Microsoft's standard licensing DPA — no separate request. AWS Bedrock and Google Vertex AI both offer Claude under the hyperscaler's own BAA, because the model runs inside your cloud account/VPC and the provider never sees the data — that's actually a legitimate way to get BAA-covered Claude access without negotiating a BAA directly with Anthropic. Anthropic's own direct API and Enterprise plan can be covered too, but only when a BAA is explicitly signed and approved — it's not default, and the covered API surface has real gaps: things like the Batch API, Files API, and Code Execution aren't covered even under a signed BAA. Claude Code is only BAA-covered with Zero Data Retention explicitly enabled on a qualified account — and Zero Data Retention itself isn't a default setting either, it's a separate approval-gated arrangement, and it's mutually exclusive with BAA 'Covered Models.' Consumer claude.ai and Claude for Teams are never in scope. The interview-ready version: don't say 'Claude is HIPAA compliant' — say 'HIPAA-eligibility attaches to the specific access path — Bedrock, Vertex, Azure, or a signed direct BAA — and you verify the exact one your vendor contract covers before PHI ever touches it.'"

### On asymmetric embedding setup
> "In RAG, the query and the document are structurally different — a query is short and question-like; a document chunk is long and statement-like. An asymmetric setup uses separate encoders tuned for each. Models like Cohere embed-v3 and E5 have an explicit input_type flag for this. Using a symmetric model — same encoder for both — is a common prototype shortcut that leaves precision on the table."

### On embedding drift
> "Once you commit an embedding model to production and index your corpus, upgrading that model means re-embedding everything. If you mix vectors from two different model versions in the same index, retrieval silently degrades — no error, just worse results. I treat embedding model choice as a high-stakes architectural decision, and upgrades as deliberate projects with a full re-index plan and dual-index cutover strategy — build the new index fully in parallel under the new model, shadow-validate retrieval quality against the live index, then cut read traffic over and decommission the old one. Same shape as a blue-green deployment, applied to a vector index instead of an application server."

### On hybrid search and exact-match requirements
> "Anytime your corpus has exact-reference terminology — policy numbers, ICD-10 codes, CPT codes, drug names, years, identifiers — you need BM25 alongside dense retrieval. Embeddings blur these together. BM25 is the production standard for keyword retrieval: probabilistic, term-frequency weighted, fast. For domains with heavy synonym usage — clinical abbreviations like MI, HTN, DM2 — SPLADE adds vocabulary expansion on top of BM25, at the cost of additional inference latency. When I hear 'exact-match requirements' in a requirements conversation, it's a trigger to check three things, not just reach for BM25 reflexively: is there also heavy synonym/abbreviation variation on top of the exact terms (→ SPLADE, not plain BM25); is the identifier something that should just be extracted as a structured metadata field at ingestion and filtered on exactly rather than left to retrieval at all (often the better answer for something like a policy number); and does the tokenizer itself preserve the distinguishing characters — an aggressive stemmer or lowercaser can erase exactly the distinction you added BM25 to protect."

### Full Layer 3 talk track
> "For indexing, I'm making two decisions: embedding model and vector store. On the embedding model — the first constraint is compliance. In healthcare with PHI, I can't send document text to a third-party embedding API without a BAA, so I'd evaluate Azure OpenAI (HIPAA BAA available) or a self-hosted model like bge-large. I'd benchmark on our actual documents, not MTEB. I'd use an asymmetric setup since clinical queries and policy chunks are structurally different. For the vector store, PHI rules out Pinecone. If they're on Postgres, pgvector is the simplest path. For high-performance hybrid search from day one, Qdrant or Weaviate self-hosted. Critical: access control gets enforced at the retrieval layer, not after — you can't filter sensitive content after it's already in the LLM's context."

---

## Layer 4: Retrieval Pipeline — Talk Tracks by Use Case

### Universal framing (say this before any use case)
> "Retrieval isn't a single step — it's a pipeline. Each stage has a latency cost, and the total has to fit inside your product's tolerance. The director decision is knowing which stages to include or skip based on that budget and the use case's accuracy requirements."

---

### Use Case 1: NFL Media Guides (stats, bios, coach quotes)
*[Personal: mediaguide-langgraph + gamebook-langgraph projects in portfolio]*

> "NFL media guide data is a multi-modal retrieval problem. For precise defensive stats — third-down efficiency in 2019, sack totals, player-season records — BM25 is non-negotiable. A semantic search for 'efficient third-down defense' might return philosophically interesting results but miss the actual stat you need. For biographical content and narrative scouting reports, dense retrieval handles the semantic similarity. For coach quotes, I actually want both: exact retrieval to get the right quote, plus the surrounding context for sentiment analysis. I wouldn't bother with a full reranker pipeline here — this is a research tool, latency tolerance is high, and accuracy errors aren't life-or-death. Self-query is useful for filtering by team, season, or player position. The bigger architectural challenge is that football stats are inherently relational — a player's performance connects to team, opponent, season, game — so GraphRAG or a hybrid graph+vector approach becomes interesting for deeper analytical queries."

---

### Use Case 2: Clinical Healthcare (formularies, coverage policies, clinical guidelines)
*[Personal: IBM regulatory compliance RAG, pharma/insurance background]*

> "For a clinical policy system, every stage of the retrieval pipeline earns its latency cost. I'd lead with self-query retrieval — parse 'what's the 2024 GLP-1 formulary coverage for diabetic patients' into structured filters (year, doc_type) plus a semantic query, because embeddings can't reliably distinguish 2024 from 2022 policies. Then hybrid BM25 + dense, because clinical terminology has exact-match requirements: ICD-10 codes, NDC numbers, CPT codes. Then cross-encoder reranking on top-20 — in a clinical setting, the 300ms cost is worth the precision gain. And critically, a fallback threshold: if retrieval confidence is below threshold, I return 'insufficient information' rather than generating from weak context. In healthcare, a confident wrong answer is a patient safety issue. Citations are mandatory — every generated statement must link back to a specific policy document and section. I'd use Qdrant or Weaviate self-hosted for PHI compliance, with Azure OpenAI embeddings under a HIPAA BAA."

---

### Use Case 3: HR Policy Docs (PTO, benefits, 401k, healthcare plans)
*[Common F500 enterprise use case]*

> "HR policy RAG is a good example of where I'd push back on a default latency assumption rather than design to one. The intuitive assumption is 'employees expect consumer-grade speed' — but on the actual HR-policy program I worked, embedded directly into MS Teams, there was no real latency requirement at all; users were fine waiting a minute or more as long as the answer was correct and came with a citation. What actually mattered was accuracy and provenance: a large historical document set meant multiple policy vintages existed side by side, so users needed the newest version by year surfaced, with the specific document referenced, not just an answer. That reframes the design: I'd still use self-query to extract filters like job level, location, business unit, and plan year, but the reranking priority isn't 'fast enough' — it's recency-aware ranking, boosting or hard-filtering toward the current/active version of a policy over superseded ones unless the query explicitly asks for historical context. The lesson for a Director-level answer: don't assume a latency budget from the consumer-UX default — ask what the actual users tolerated, then design the retrieval pipeline's depth (self-query, hybrid, reranking) against their real answer. Multi-tenancy is still a real concern if business units have different policies — namespace isolation in the vector store so one division's query can't surface another's. And an explicit fallback for genuine edge cases — 'For specific benefits questions, please contact HR directly' — is still the right pattern when the system's confidence is low, independent of latency."

*[Personal: on this program the correct-answer-plus-citation-plus-current-year-version requirement drove the design far more than speed did — a useful correction to the generic 'HR wants it fast' assumption.]*

---

### Use Case 4: Midstream Oil & Gas Pipeline Construction + Compliance
*[Personal: PHMSA/Energy Transfer/FERC background]*

> "Pipeline compliance is one of the highest-stakes RAG applications I can think of — a wrong answer about regulatory requirements isn't just inaccurate, it's a potential safety incident and federal liability. The document corpus is structurally demanding: PHMSA regulations like 49 CFR Part 192 have exact section numbers that must be retrieved precisely, state DOT requirements that vary by jurisdiction, environmental permits with specific conditions, and engineering specifications with complex tables. BM25 is essential for regulation numbers, permit IDs, and section references. Self-query is critical for filtering by regulation type, jurisdiction, and effective date. I'd use the full pipeline — self-query, hybrid BM25+dense, metadata filtering by jurisdiction and date, cross-encoder reranking — and accept 5–10 second latency because the users are compliance engineers doing reference lookups, not consumers expecting instant results. The fallback is explicit: anything ambiguous routes to 'consult a licensed compliance engineer' with the relevant regulation sections surfaced for their review. GraphRAG is genuinely interesting here — pipeline regulations have interconnected requirements where federal rules reference state rules reference local permits, and navigating that graph of dependencies is a real retrieval challenge that vector search alone doesn't solve well. Concretely: a worked graph for this program would have nodes for a pipeline segment, the state Railroad Commission rules governing its jurisdiction, the federal PHMSA/FERC rule it implements or is preempted by, and the EPA permit conditions attached to it — edges like 'implements,' 'requires-permit-from,' and 'applies-in-jurisdiction.' A query like 'what permits does this segment need crossing from Texas into Oklahoma' genuinely requires traversing pipeline segment → jurisdiction → state rule → federal rule → EPA permit across three separate source documents; no single vector match assembles that. *(Full GraphRAG POC using this worked example is queued — see LEARNING CALLOUTS below.)*"

> On small-to-big for this corpus specifically — see the Layer 2 note above: index matches on a specific regulation clause routinely needed to be spliced back to the containing section of a 20+ page document, not the whole document, to give a compliance engineer usable context.

---

### F500 Common Use Cases (brief talk points)

**Legal / Contract Management:**
> "Contract clause retrieval is a classic exact-match problem — you need to find specific indemnification language, limitation of liability caps, or governing law provisions. BM25 for clause terms and party names, dense for semantic similarity to 'force majeure' concepts across different phrasings. Self-query to filter by contract type, counterparty, and effective date. Citation is mandatory — legal review requires knowing exactly which contract version a clause came from."

**Financial Services / Regulatory Compliance:**
> "SEC filings, FINRA rules, Basel III documentation — all require exact regulation number retrieval (BM25) plus semantic understanding of how rules apply to specific situations (dense). The complication is that regulations update: metadata filtering by effective date is critical, and stale embeddings (vectors from superseded regulation versions) are an active risk. This is a corpus where incremental re-indexing on regulatory updates is a designed operational process, not an afterthought — and it's worth being precise about scope when this comes up in an interview: 'incremental re-indexing' means only the new or changed document gets embedded and added, with the superseded version marked (not deleted — regulated corpora often need historical queries against what a rule said at a past point in time) and retrieval defaulting to the active version unless a query asks otherwise. That's a completely different, much more frequent operation than a full corpus re-embed, which only happens when the embedding *model itself* changes — the dual-index cutover scenario from Layer 3. A shared cross-jurisdiction database with constant policy churn just means operation one happens often, not that operation two does."

**Manufacturing / Quality Management Systems:**
> "QMS document RAG — SOPs, work instructions, ISO standards — has a strong procedural structure. Chunking follows the numbered section hierarchy (1.0, 1.1, 1.2...). BM25 for part numbers, process IDs, revision numbers. Dense for 'how do I perform X operation' queries. The key governance requirement: version control matters enormously. An employee finding an outdated SOP is a non-conformance event. Metadata filtering by revision status (active/superseded) and effective date is non-negotiable."

**Customer Service Knowledge Base:**
> "Consumer-facing knowledge base RAG has the tightest latency budget — 1 second or under — which forces architectural choices. I'd typically skip the cross-encoder reranker or use a very small one (ms-marco-MiniLM), lean on a strong hybrid retrieval setup, and focus on quality at the chunking layer rather than the retrieval layer. Fallback routing to a human agent when confidence is low is standard here."

---

### Life Sciences — Ideas and Talk Track

**Best project ideas:**

1. **Clinical Trial Protocol Q&A** — Public trial protocols from ClinicalTrials.gov (NCT numbers, eligibility criteria, endpoints, phase). Demonstrates: complex structured document parsing, exact NCT number retrieval (BM25), semantic eligibility criteria matching, citation required for regulatory context. High value signal: clinical trials folks spend enormous time searching protocol libraries.

2. **FDA 510k / PMA Submission Search** — All public on FDA.gov. Class II/III medical device submissions. Demonstrates: regulatory document ingestion, multi-document Q&A ("how have other manufacturers addressed sterilization validation for this device class?"), exact predicate device retrieval.

3. **Drug Label / Prescribing Information (openFDA)** — *Already partially built in rag-eval-harness.* Extend: add Qdrant comparison, add self-query for drug class/indication/contraindication filtering, add a proper eval harness using RAGAS.

4. **Pharmacovigilance FAERS Signal Detection** — FDA Adverse Event Reporting System is public. RAG over adverse event narratives + structured signal detection. Very high signal for pharma/biotech roles.

**Life Sciences talk track:**
> "Life sciences is one of the most demanding RAG environments because the document types are radically heterogeneous — clinical trial protocols, drug labels, FDA submissions, peer-reviewed literature, pharmacovigilance reports — and the accuracy bar is very high given regulatory stakes. For a clinical trial team using RAG over their protocol library, I'd prioritize: exact NCT number retrieval via BM25, semantic eligibility criteria matching for patient screening, self-query to filter by therapeutic area, phase, and indication. The hardest retrieval challenge in life sciences is multi-document reasoning — 'how do similar trials handle the primary endpoint design for this indication?' requires retrieving from multiple protocols and synthesizing across them, which is where agentic RAG with multi-document agents starts making sense over a single-pass retrieve-then-generate approach."

---

## ⚠️ LEARNING CALLOUTS — Needs deeper study

**Asymmetric vs Symmetric Embedding:**
Build a note + card set: when to use each, which models support it natively, what the query instruction prefix looks like in code, when symmetric is appropriate (dedup, clustering, doc-to-doc similarity).

**Qdrant + Weaviate hands-on:**
Extend rag-eval-harness (FDA drugs / Chroma + BM25) to add Qdrant as a third comparison store. Show hybrid search, filtered HNSW, and BM42 in action. Portfolio differentiator vs just Chroma.

**CRAG (Corrective RAG):**
Study the paper and build a small implementation. Understand exactly what "evaluate retrieved context quality" means in practice — what LLM call, what prompt, what score triggers fallback.

**GraphRAG:**
Especially relevant for oil & gas (regulatory dependency graphs) and NFL stats (relational entity graphs). Queue: Microsoft GraphRAG paper + implementation, when graph beats vector search.

---

## Layer 5: Generation + Governance

### On why governance is the differentiator (say this to open any L5 question)
> "Most candidates can speak fluently to generation — prompt structure, context injection, output format. Almost none have production governance experience. The two concerns I always separate are generation — how you construct the prompt, enforce citations, and format output — and governance — the control plane: access, PHI handling, guardrails, faithfulness checking, audit logging, token spend, regulatory compliance. That asymmetry is where production experience shows."

---

### On prompt construction — the four mandatory sections
> "A production RAG prompt has four mandatory sections. The system prompt establishes the role and citation requirement — 'Answer ONLY using the provided context. For every factual claim, cite the document and section. If context is insufficient, say so explicitly. Do not use general knowledge.' Then the retrieved context, with explicit document and section labels so every chunk has a citation anchor. Then the user query, structurally separate from the system prompt — never concatenated into it. And critically, the output format section — a JSON schema with answer, sources with doc_id and section and page, and a confidence field. That output format is what makes citation validation, faithfulness checking, and downstream audit logging programmatically possible. It's the most frequently skipped section and the most consequential for production governance."

---

### On how citations actually happen — a mechanism, not a feature
> "There's no single API call or 'citations mode' that gives you this — it's an architecture spanning three layers, and I'd walk through it that way if asked. First, at ingestion: doc_id, section, and page get extracted as metadata on the chunk, not just its text — that's the manifest-building step from Layer 1. Second, at retrieval: that metadata has to ride along as payload on every returned chunk, not get stripped down to bare text before it reaches the prompt. Third, at generation: the prompt labels each chunk in context with its citation anchor — 'Document: Formulary 2024, Section 3.2' — and the output is constrained into a structured schema, typically via tool-use or JSON-schema-enforced structured output, with a sources field listing doc_id, section, and page per claim. If I want citations I can actually trust, not just citations the model claims, I add a fourth layer: a faithfulness or NLI check that verifies the cited chunk actually contains the text supporting that claim before the response goes out. Skip any one of those four and citations either don't exist or can't be trusted."

### On faithfulness vs correctness — the key distinction
> "Faithfulness and correctness sound like the same thing, but they're not — and the distinction matters in production. Faithfulness is precision: every claim in the answer is supported by the retrieved context. Correctness is accuracy: the answer is actually true in the world. Faithfulness is measurable at runtime — you compare the answer to the chunks you retrieved, no ground truth needed. Correctness requires ground truth labels — you can't check it live. In production, faithfulness is your hallucination detection signal."

> "The failure case that makes this concrete: user asks what dairy products are covered. Retrieved context says milk, cheese, yogurt. Model answers: milk, cheese, yogurt, and tofu as a non-dairy alternative. Tofu is not in the context — the model pulled it from training weights because tofu appears near 'dairy alternatives' in its training data. That's a faithfulness failure even though tofu is a true statement about the world. In a regulated industry, parametric knowledge like that is potentially outdated, unverifiable because there's no citation path, and may directly contradict your organization's specific policies. The system prompt tells the model not to use general knowledge; the faithfulness check detects when it does anyway."

---

### On LLM-as-judge deployment patterns
> "There are four ways to deploy LLM-as-judge in production, and the right choice depends on stakes and latency tolerance. Offline only — you run it against a test dataset before deploying a new retrieval strategy, catching faithfulness regressions before they hit users. Shadow or async — you return the response immediately, run the faithfulness check in parallel, log results, and alert if the failure rate exceeds a threshold. No latency impact, but you can't stop a bad response. Blocking — you run the faithfulness check before returning to the user; if it fails, you trigger a CRAG loop or return a fallback. Adds 300 to 500 milliseconds. And the CRAG loop itself — generate, evaluate, pass returns the answer, fail reformulates the query and re-retrieves, and after two or three retries you return an explicit fallback rather than a wrong answer. Always cap retries — without a cap, a query that consistently fails faithfulness can loop indefinitely and burn your token budget."

> "What does the user see when faithfulness fails? An explicit fallback: 'I couldn't find sufficient information in our documentation to answer this accurately.' Not 'your response evaluated as unfaithful.' The evaluation is an internal quality gate. The failure is logged for your observability dashboard — failure rates, which query types fail most, retrieval quality trends — but that's all backend. The user sees either a validated answer or a graceful fallback."

---

### On NLI vs LLM-as-judge — volume-based selection
> "LLM-as-judge is thorough but expensive — 300 to 800 milliseconds, full model inference per query. NLI — Natural Language Inference — is a small fast classifier, 10 to 50 milliseconds, that categorizes each sentence as entailed, contradicted, or neutral by the context. At Google AI Overviews scale — millions of queries per day — you run NLI only; LLM-as-judge per query isn't economically viable. For an enterprise clinical tool running a few thousand queries per day, you can afford blocking LLM-as-judge because the latency is acceptable and the stakes are high. The interesting middle ground is using NLI as a router: if NLI scores HIGH confidence entailed, return directly. If NLI is uncertain, escalate to LLM-judge async and flag for review if it fails. You get speed for the easy cases and thoroughness for the ambiguous ones."

---

### On prompt injection defense
> "Prompt injection is OWASP LLM Top 10 number one — and the more dangerous form in enterprise RAG isn't a user trying to override your system prompt. It's indirect injection: a document in your corpus that contains injection strings. When that document gets retrieved and injected into context, those strings run. A policy document that says 'Ignore previous instructions' in its text will pass right through retrieval and into your prompt assembly. Defense in layers: structural separation first — never concatenate user input into the system prompt string; use separate API roles so the model treats them at different trust levels. Input validation classifier on user queries. Chunk sanitization on retrieved documents before context assembly — strip known injection patterns from chunk text before they reach the prompt. Scope enforcement — a fast topic classifier that checks whether a query is even within your domain before it reaches retrieval. And canary tokens in the system prompt: a hidden phrase that, if it appears in the model's output, tells you the system prompt was likely leaked."

---

### On PHI handling — three-point scrubbing architecture
> "In a HIPAA context, PHI scrubbing isn't a single step — it's three points. Input scrubbing: before the user's query reaches the LLM, strip or mask any PHI the user typed. Context scrubbing: before retrieved chunks are injected into the prompt — clinical documents often contain real patient examples or case studies with embedded PHI. Output scrubbing: before the generated response is returned, because the model may surface PHI from context even if you scrubbed the chunks. The tool I reach for is Microsoft Presidio — open source, detects 40-plus entity types including SSNs, MRNs, dates, and names. AWS Comprehend Medical and Azure AI Language are the managed alternatives. Three points. Not one, not two."

---

### On audit logging in regulated AI systems
> "In a HIPAA-regulated AI system, the audit log is as important as the application itself. Every interaction needs to capture: user identity, timestamp, the PHI-scrubbed version of the query — not the raw query, which would make the log itself a PHI data store — the chunk IDs that were retrieved, the generated response, token count and cost, and whether any guardrails fired. The log is immutable and append-only. HIPAA minimum retention is six years. And you log access to the audit log itself — who looked at the audit trail is itself auditable. I've built this directly in my RxSense MCP server — RBAC controls who can invoke which tools, every invocation is logged, and token spend is tracked per user."

---

### On NIST AI RMF — mapping governance to production proof points
> "When people ask how I think about AI governance at the enterprise level, I map it to NIST AI RMF's four functions. Govern: policies and accountability — who owns AI risk decisions, who approved the system. In my RxSense work, that's RBAC and SSO defining which teams can access which AI capabilities. Map: identify the specific risks for this use case — for clinical RAG, PHI exposure and hallucination risk drove the architecture. Measure: quantify and monitor those risks — audit logs, token spend dashboards, guardrail trigger rates, faithfulness failure rates. Manage: the controls and incident response — PHI scrubbing at three points, token hard stops, CRAG fallbacks, model versioning controls. Most candidates know LLM techniques. Almost none can articulate governance at the RMF level. That's the asymmetry."

---

### On multi-agent terminology (when asked to distinguish tools from agents)
> "The terminology matters here. A tool is a deterministic function — search_database(), call_api(), read_file(). No LLM inside, no decision-making. It executes and returns. An agent is an LLM-backed decision maker with its own context, system prompt, and tool access — it perceives input, reasons, and decides what to do next. A system is agentic when a single LLM makes decisions about control flow across multiple steps. It becomes multi-agent when two or more LLM-backed agents interact, each with independent context and reasoning. The pattern I care most about architecturally is the difference between static topology and dynamic spawning. Static topology — LangGraph is the canonical example — defines agents and edges at design time. The architecture enforces scope: no edge means the action is impossible. Dynamic spawning is when an agent creates new agent instances at runtime that didn't exist before. That's where you lose observability — dynamically spawned agents don't automatically inherit the parent trace context — and where cost governance breaks down, because you can't pre-define token budgets for agents that don't exist until runtime."

---

## ⚠️ LEARNING CALLOUTS — Layer 5 / Governance

**CRAG implementation project:**
Study the CRAG paper. Build a small implementation. Understand exactly what prompt you use to evaluate retrieved context quality, what threshold triggers fallback, and how the reformulated query differs from the original.

**RAGAS hands-on:**
Extend rag-eval-harness with RAGAS metrics — add faithfulness, answer relevance, context precision scores alongside the existing BM25/dense comparison. Makes the project a complete eval demonstration.

**Guardrails AI / NeMo Guardrails:**
Hands-on with at least one. Build a simple topic scope enforcer and a PHI filter using Guardrails AI. Portfolio signal: showing you've used the tools, not just named them.

**Presidio hands-on:**
Add a Presidio scrubbing step to rag-eval-harness. Show the before/after on FDA drug queries that might include patient-identifying context.

---

*Updated: 2026-07-25 — Session 1 (All 5 Layers complete, 2026-07-22) + Q&A correction pass (compliance/BAA landscape, MTEB pharma-specificity, exact-match/dual-index/citation mechanisms, small-to-big clause anecdote, HR latency correction, financial-services re-index scope)*
