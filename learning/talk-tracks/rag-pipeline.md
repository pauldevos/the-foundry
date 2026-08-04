# Interview Talk Tracks — RAG Pipeline
*These are polished, interview-ready phrasings. Learn the concepts, then riff from these anchors.*
*Updated: 2026-07-25 — Session 1 (All 5 Layers complete, 2026-07-22) + Q&A correction pass + domain/need/solution/proxy-contrast rewrite (every section now anchored to a concrete use case, plain-language enough for a non-technical listener, with an explicit "looks like it should work — doesn't, here's why" contrast wherever one exists)*

---

## Layer 1: Document Ingestion & Parsing

### On file type diversity and tool selection
> "Picture a PBM's document intake: some formularies arrive as clean digital PDFs from an internal system, others as scanned faxes from a provider's office, others as Word docs or web pages pulled from a state Medicaid site. The ask is one ingestion pipeline that gets usable text out of all of them — not four separate one-off scripts. The fix is to classify every document by type first, then route it: scanned pages go to AWS Textract or Azure Document Intelligence, which are table-aware and return bounding boxes, not just raw text; clean digital PDFs go to a fast layout-aware library like PyMuPDF; complex clinical layouts with nested tables go to Docling, IBM's open-source parser, which outputs clean markdown. You might think a single strong parser — PyMuPDF, say — is enough, since it's fast and free on digital PDFs. It isn't a matter of it doing a little worse on scans — a scanned fax has no embedded text layer at all, so a digital-PDF extractor returns nothing, not a lower-quality result. That's why routing by document type is a hard requirement, not a nice-to-have."

### On OCR tool choice (when challenged)
> "Say a PBM is processing thousands of faxed prior-authorization forms a month — that's the real ask, not 'do OCR.' For high-volume simple text — a typed memo, a clean single-column page — RapidOCR or PaddleOCR are fast, free, and genuinely enough. But a prior-auth form has a table: diagnosis code, drug requested, dosage, prescriber NPI, all in grid cells — and that's where the free general-purpose tools stop being the right choice. Textract or Azure DI cost more per page but return the table as structured cells with coordinates, which is what lets you reconstruct which diagnosis code paired with which requested drug. You might think Tesseract is a reasonable free substitute here, since it's the best-known open-source OCR engine — it isn't, for this job specifically: it reads the words in the table fine but loses the grid structure, so you get the right words in the wrong cells, which is worse than useless on a form where the pairing between fields is the entire content."

### On metadata extraction — the domain-awareness gap
> "Take a PBM again: a provider asks 'what's our GLP-1 coverage policy?' against a 15-year formulary archive. The ask isn't 'find text about GLP-1s' — it's 'find the *current* GLP-1 policy,' and a policy from 2011 reads almost identically, semantically, to one from 2024 — embeddings don't reliably separate '2011' from '2024' by content alone. You might think the parser's automatic metadata already covers this — Azure Document Intelligence extracts page count, language, detected form fields out of the box. That's generic, structural metadata, not the domain fact that actually matters here: which policy is currently in effect. So I add a lightweight extraction step after parsing — a structured LLM call reading the first page, outputting effective_date, doc_type, policy_id as JSON. That becomes the document manifest: extracted once at ingestion, and it's what lets retrieval filter to only current-year policies instead of returning a blended pile of every year the drug's ever been covered."

### On tables in chunking
> "A GLP-1 formulary's coverage-tier table is often the entire answer to a question — 'what tier is Ozempic in for a commercial plan' is answered by one row of one table, not a paragraph. So tables are first-class objects in my pipeline, never left to generic text chunking. I detect them at parse time (PPStructureV3, or Azure DI's table API), then apply a table-specific rule: a coverage-tier or dosage table becomes its own chunk with a synthetic header I generate — 'Table: GLP-1 coverage tiers by plan type, effective 2024' — so it's embeddable and citable on its own. A small reference table sitting inside a paragraph of prose stays attached to that paragraph. You might think every table deserves this same standalone treatment — it doesn't scale to a 200-row rebate schedule; embedding that as one chunk produces a diluted, useless vector, so past a size threshold I extract it to a structured store instead and let a query agent read it directly rather than pretending it's prose."

---

## Layer 2: Chunking

### On embedding token limits (Problem 1)
> "A 300-page clinical guideline is roughly 150,000 tokens. Most embedding models cap input at 512 to 8,000 tokens depending on the model. You might think using an LLM with a huge context window — Claude or GPT with a 200K-token window — solves this, since it could 'read' the whole document. It doesn't, because that's a different limit: the embedding model that turns text into a searchable vector has its own, much smaller input cap, independent of how large a generation model's context window is. You physically cannot embed the guideline as one unit regardless of which LLM you generate answers with — chunking is a hard technical constraint at the embedding step, not a design preference."

### On retrieval precision degradation (Problem 2)
> "Say a single chunk spans both cardiovascular medication names and their dosing protocols. An embedding is effectively an average over everything in the chunk — so a query about dosing protocols alone might not surface that chunk precisely, because the cardiovascular-medication content pulls the vector in a different direction. You might think the fix is simply making every chunk as small as possible — it isn't: shrink a chunk below the actual scope of a real question and you split a self-contained answer (a drug and its own dosing rule) across two separate, incomplete chunks, and now neither one alone answers the question. The real fix is matching chunk size to the typical query's scope, not minimizing chunk size."

### On document-type-specific chunking
> "A single chunking strategy across a mixed corpus is the choice that looks reasonable and isn't: a one-page HR memo announcing a holiday schedule change doesn't need hierarchical chunking, it's naturally one chunk. But a 40-page clinical guideline chunked the same flat way loses its heading structure — the thing that actually tells you where one policy topic ends and the next begins. So long structured documents get hierarchical chunking off the document's own heading numbers, with small-to-big retrieval on top: embed at the section level for match precision, return the parent chapter at synthesis time so the model has enough surrounding context to not misread the section in isolation."

### On small-to-big / parent-document retrieval — what "parent" actually means
> "Small-to-big retrieval is the pattern for a long, deeply-structured document where the answer lives in one specific clause but that clause is meaningless without its surrounding section. I embed and index at the leaf level — aligned to the document's own numbered heading hierarchy, so a specific subsection is its own chunk — because that's what gives embedding precision. But each leaf chunk carries a pointer to its parent section. At retrieval time I match on the leaf, then fetch and return the immediate parent section for synthesis — not the whole document. A 20-page regulatory document doesn't need to be dumped into context to correctly answer a question about one clause inside it; you need the leaf match's precision and just enough surrounding structure — typically the containing section, occasionally a full chapter — to not misinterpret it. You might think 'small-to-big' just means 'retrieve small, then hand the model the entire source document' — it isn't the same move at all: that defeats the point of chunking in the first place and reintroduces the same blended-signal problem hierarchical chunking was solving."

*[Personal: this is exactly the retrieval shape our midstream oil & gas pipeline compliance program needed — index matches would land on a specific policy clause (e.g. 12.3.5) inside a single document that ran longer than 20 pages, and the correct answer required splicing back to the containing section, not the whole document, to give the compliance engineer usable context.]*

---

## Layer 3: Indexing

### On embedding model selection — the MTEB trap
> "I don't pick an embedding model off the MTEB leaderboard. You might think a model's MTEB rank is a reasonable proxy for how well it'll perform on your corpus — especially since MTEB includes a labeled 'medical' category, so surely that transfers to a pharma formulary. It doesn't transfer as cleanly as it looks: MTEB's medical tasks are literature-QA-shaped, PubMed-style question answering, not formulary-coverage-policy or drug-label language. A model that tops the medical leaderboard tells you almost nothing about how it'll rank a pharma coverage-policy chunk against a general healthcare-advice chunk — those are a different kind of 'medical' text entirely. I benchmark on a representative sample of my own data before committing to a model, full stop."

### On data residency and compliance — lead with this in regulated industries
> "The first constraint for embedding model selection in a regulated environment isn't capability — it's data residency and compliance. In healthcare with PHI, I can't send document text to a third-party embedding API without a Business Associate Agreement. That immediately narrows the field: Azure OpenAI offers a HIPAA BAA and hosts OpenAI embedding models in your tenant. Self-hosted open-source models like bge-large or E5-large are the other path — nothing leaves your infrastructure. This is often the decision that picks the model for you before you even look at quality benchmarks."

*[Personal anchor: At Neudesic/IBM as an Azure OpenAI partner — defaulted to text-embedding-3-large unless a client directed otherwise. Right call for Azure-first shops with a BAA.]*

### On which Claude/LLM access paths are actually HIPAA-eligible — the trap candidates fall into
> "There's a common mistake I watch for: assuming any access to a frontier model is HIPAA-safe because the vendor 'does' BAAs. The BAA attaches to a specific product surface, not the model itself. For Claude specifically: Azure OpenAI's BAA comes automatically through Microsoft's standard licensing DPA — no separate request. AWS Bedrock and Google Vertex AI both offer Claude under the hyperscaler's own BAA, because the model runs inside your cloud account/VPC and the provider never sees the data — that's a legitimate way to get BAA-covered Claude access without negotiating a BAA directly with Anthropic. You might think that same AWS BAA extends to calling Anthropic's public API from inside your AWS environment, since you're still 'in AWS' — it doesn't: that traffic egresses to an environment AWS doesn't control, so the AWS BAA stops at the Bedrock boundary. Anthropic's own direct API and Enterprise plan can be covered too, but only when a BAA is explicitly signed and approved — it's not default, and the covered surface has real gaps: the Batch API, Files API, and Code Execution aren't covered even under a signed BAA. Claude Code is only BAA-covered with Zero Data Retention explicitly enabled on a qualified account, and consumer claude.ai and Claude for Teams are never in scope. The interview-ready version: don't say 'Claude is HIPAA compliant' — say 'HIPAA-eligibility attaches to the specific access path, and you verify the exact one your vendor contract covers before PHI ever touches it.'"

### On asymmetric embedding setup
> "Picture a pharmacist typing a two-word question into a formulary lookup tool — 'Ozempic coverage' — against a library of long policy documents. That's an asymmetric problem: the question and the answer are different shapes of text, short and long, and a single generic encoder that treats both the same way underperforms. Cohere embed-v3 and E5 solve this with two separate encoders, one tuned to queries and one tuned to documents, explicitly trained to bridge that shape gap. You'd reach for a symmetric setup instead if the actual job was comparing two documents to each other — deduplicating near-identical policy versions, or clustering similar coverage criteria together. That's not a worse tool, it's the right tool for a different job: doc-to-doc, not question-to-document. Using one symmetric encoder for the pharmacist's-question case is a common prototype shortcut that quietly leaves retrieval precision on the table."

### On embedding drift
> "Once you commit an embedding model to production and index your corpus, upgrading that model means re-embedding everything. You might think you can upgrade gradually — re-embed only new documents going forward under the new model and leave the old vectors as they are — it doesn't work: mixed vectors from two different model versions sitting in the same index silently degrade retrieval, with no error thrown, just worse results that look like a normal bad day. I treat embedding model choice as a high-stakes architectural decision, and upgrades as deliberate projects with a full re-index plan and dual-index cutover strategy — build the new index fully in parallel under the new model, shadow-validate retrieval quality against the live index, then cut read traffic over and decommission the old one. Same shape as a blue-green deployment, applied to a vector index instead of an application server."

### On hybrid search and exact-match requirements
> "I'll make this concrete with a PBM formulary example, because 'exact-match terminology' as an abstract list doesn't show you why it matters. Take the query: 'is Ozempic, NDC 0169-4132-12, covered for a patient with ICD-10 E11.9 under the 2024 formulary?' Dense retrieval alone fails this in a specific, predictable way — not randomly. 'Ozempic' and 'semaglutide' embed close together, which is correct, that's semantic similarity doing its job. But NDC 0169-4132-12 and NDC 0169-4133-12 — a different dosage or package size of the same drug, governed by a different coverage line — are nearly identical strings, so they embed almost identically too, and dense retrieval can't tell them apart. Same problem one level up: ICD-10 E11.9 (type 2 diabetes, no complications) and E11.65 (type 2 diabetes with hyperglycemia) are semantically adjacent but carry different coverage criteria — a near-match on the code is a wrong answer, not an approximately-right one. That's what 'exact-match requirement' actually means: not 'this corpus has codes in it,' but 'the distance between right and wrong is smaller than the embedding model's resolution.' BM25 catches the literal NDC/ICD-10/CPT tokens where dense can't. Then I check three follow-on things rather than stopping at 'add BM25': is there also heavy synonym/abbreviation variation layered on top — a formulary corpus mixing 'T2DM,' 'type 2 diabetes mellitus,' and 'E11.9' for the same condition needs SPLADE's vocabulary expansion on top of BM25, plain BM25 won't bridge that; is the identifier something I should just extract as a structured metadata field at ingestion off the policy's own header table and filter on exactly, rather than trust to text retrieval at all — for NDC/plan-year that's usually the better answer since formulary documents are already semi-structured; and does the tokenizer preserve the exact string — NDC codes are hyphen-delimited triplets (labeler-product-package), and a tokenizer that strips punctuation or over-stems can merge or truncate segments, breaking the very distinction BM25 was added to protect."

*[Personal: this is the RxSense/PBM formulary shape directly — NDC-level and ICD-10-level precision is where a confident-but-wrong retrieval becomes a coverage decision error, not just a bad search result.]*

### Full Layer 3 talk track
> "For indexing, I'm making two decisions: embedding model and vector store. On the embedding model — the first constraint is compliance. In healthcare with PHI, I can't send document text to a third-party embedding API without a BAA, so I'd evaluate Azure OpenAI (HIPAA BAA available) or a self-hosted model like bge-large. I'd benchmark on our actual documents, not MTEB. I'd use an asymmetric setup since clinical queries and policy chunks are structurally different. For the vector store, PHI rules out Pinecone. If they're on Postgres, pgvector is the simplest path. For high-performance hybrid search from day one, Qdrant or Weaviate self-hosted. Critical: access control gets enforced at the retrieval layer, not after — you can't filter sensitive content after it's already in the LLM's context."

---

## Layer 4: Retrieval Pipeline — Talk Tracks by Use Case

### Universal framing (say this before any use case)
> "Retrieval isn't a single step — it's a pipeline. Each stage has a latency cost, and the total has to fit inside your product's tolerance. The director decision is knowing which stages to include or skip based on that budget and the use case's accuracy requirements."

---

### Use Case 1: NFL Media Guides (stats, bios, coach quotes)
*[Personal: mediaguide-langgraph + gamebook-langgraph projects in portfolio]*

> "NFL media guide data is a multi-modal retrieval problem. For precise defensive stats — third-down efficiency in 2019, sack totals, player-season records — BM25 is non-negotiable. You might think semantic search alone is fine here since it's built to find conceptually related content — it isn't: a search for 'efficient third-down defense' can return philosophically interesting results about defensive philosophy while missing the actual stat row you needed, because the number itself isn't a concept embeddings reason about. For biographical content and narrative scouting reports, dense retrieval handles the semantic similarity fine. For coach quotes, I actually want both: exact retrieval to get the right quote, plus the surrounding context for sentiment analysis. I wouldn't bother with a full reranker pipeline here — this is a research tool, latency tolerance is high, and accuracy errors aren't life-or-death. Self-query is useful for filtering by team, season, or player position. The bigger architectural challenge is that football stats are inherently relational — a player's performance connects to team, opponent, season, game — so GraphRAG or a hybrid graph+vector approach becomes interesting for deeper analytical queries."

---

### Use Case 2: Clinical Healthcare (formularies, coverage policies, clinical guidelines)
*[Personal: IBM regulatory compliance RAG, pharma/insurance background]*

> "For a clinical policy system, every stage of the retrieval pipeline earns its latency cost. You might think dense retrieval alone is enough here, since clinical language is exactly the kind of rich semantic text embeddings are good at — it isn't sufficient on its own, because the corpus is full of ICD-10 codes, NDC numbers, and CPT codes where the difference between right and wrong is a near-identical string, not a different concept. So I'd lead with self-query retrieval — parse 'what's the 2024 GLP-1 formulary coverage for diabetic patients' into structured filters (year, doc_type) plus a semantic query, because embeddings can't reliably distinguish 2024 from 2022 policies. Then hybrid BM25 + dense, for those exact-match codes. Then cross-encoder reranking on top-20 — in a clinical setting, the 300ms cost is worth the precision gain. And critically, a fallback threshold: if retrieval confidence is below threshold, I return 'insufficient information' rather than generating from weak context. In healthcare, a confident wrong answer is a patient safety issue. Citations are mandatory — every generated statement must link back to a specific policy document and section. I'd use Qdrant or Weaviate self-hosted for PHI compliance, with Azure OpenAI embeddings under a HIPAA BAA."

---

### Use Case 3: HR Policy Docs (PTO, benefits, 401k, healthcare plans)
*[Common F500 enterprise use case]*

> "HR policy RAG is a good example of where I'd push back on a default latency assumption rather than design to one. The intuitive assumption is 'employees expect consumer-grade speed' — but on the actual HR-policy program I worked, embedded directly into MS Teams, there was no real latency requirement at all; users were fine waiting a minute or more as long as the answer was correct and came with a citation. What actually mattered was accuracy and provenance: a large historical document set meant multiple policy vintages existed side by side, so users needed the newest version by year surfaced, with the specific document referenced, not just an answer. That reframes the design: I'd still use self-query to extract filters like job level, location, business unit, and plan year, but the reranking priority isn't 'fast enough' — it's recency-aware ranking, boosting or hard-filtering toward the current/active version of a policy over superseded ones unless the query explicitly asks for historical context. The lesson for a Director-level answer: don't assume a latency budget from the consumer-UX default — ask what the actual users tolerated, then design the retrieval pipeline's depth against their real answer. Multi-tenancy is still a real concern if business units have different policies — namespace isolation in the vector store so one division's query can't surface another's. And an explicit fallback for genuine edge cases — 'For specific benefits questions, please contact HR directly' — is still the right pattern when the system's confidence is low, independent of latency."

*[Personal: on this program the correct-answer-plus-citation-plus-current-year-version requirement drove the design far more than speed did — a useful correction to the generic 'HR wants it fast' assumption.]*

---

### Use Case 4: Midstream Oil & Gas Pipeline Construction + Compliance
*[Personal: PHMSA/Energy Transfer/FERC background]*

> "Pipeline compliance is one of the highest-stakes RAG applications I can think of — a wrong answer about regulatory requirements isn't just inaccurate, it's a potential safety incident and federal liability. The document corpus is structurally demanding: PHMSA regulations like 49 CFR Part 192 have exact section numbers that must be retrieved precisely, state DOT requirements that vary by jurisdiction, environmental permits with specific conditions, and engineering specifications with complex tables. BM25 is essential for regulation numbers, permit IDs, and section references. Self-query is critical for filtering by regulation type, jurisdiction, and effective date. I'd use the full pipeline — self-query, hybrid BM25+dense, metadata filtering by jurisdiction and date, cross-encoder reranking — and accept 5–10 second latency because the users are compliance engineers doing reference lookups, not consumers expecting instant results. The fallback is explicit: anything ambiguous routes to 'consult a licensed compliance engineer' with the relevant regulation sections surfaced for their review. GraphRAG is genuinely interesting here — pipeline regulations have interconnected requirements where federal rules reference state rules reference local permits, and navigating that graph of dependencies is a real retrieval challenge that vector search alone doesn't solve well. Concretely: a worked graph for this program would have nodes for a pipeline segment, the state Railroad Commission rules governing its jurisdiction, the federal PHMSA/FERC rule it implements or is preempted by, and the EPA permit conditions attached to it — edges like 'implements,' 'requires-permit-from,' and 'applies-in-jurisdiction.' A query like 'what permits does this segment need crossing from Texas into Oklahoma' genuinely requires traversing pipeline segment → jurisdiction → state rule → federal rule → EPA permit across three separate source documents; no single vector match assembles that. *(Full GraphRAG POC using this worked example is queued — see LEARNING CALLOUTS below.)*"

> On small-to-big for this corpus specifically — see the Layer 2 note above: index matches on a specific regulation clause routinely needed to be spliced back to the containing section of a 20+ page document, not the whole document, to give a compliance engineer usable context.

---

### F500 Common Use Cases (brief talk points)

**Legal / Contract Management:**
> "Contract clause retrieval is a classic exact-match problem — you need to find specific indemnification language, limitation of liability caps, or governing law provisions. You might think dense retrieval alone is enough since it's built to match 'force majeure' concepts across different phrasings — it finds the concept fine, but it won't reliably pull the exact clause number counsel needs to cite, which is why BM25 for clause terms and party names runs alongside it. Self-query filters by contract type, counterparty, and effective date. Citation is mandatory — legal review requires knowing exactly which contract version a clause came from."

**Financial Services / Regulatory Compliance:**
> "SEC filings, FINRA rules, Basel III documentation — all require exact regulation number retrieval (BM25) plus semantic understanding of how rules apply to specific situations (dense). The complication is that regulations update: metadata filtering by effective date is critical, and stale embeddings (vectors from superseded regulation versions) are an active risk. This is a corpus where incremental re-indexing on regulatory updates is a designed operational process, not an afterthought — and it's worth being precise about scope when this comes up in an interview: 'incremental re-indexing' means only the new or changed document gets embedded and added, with the superseded version marked (not deleted — regulated corpora often need historical queries against what a rule said at a past point in time) and retrieval defaulting to the active version unless a query asks otherwise. You might think a shared cross-jurisdiction database with constant policy churn means re-embedding the whole corpus on every update — it doesn't: that's a completely different, much rarer operation that only happens when the embedding *model itself* changes, the dual-index cutover scenario from Layer 3. Frequent policy churn just means operation one — per-document incremental updates — happens often, not that a full re-embed does."

**Manufacturing / Quality Management Systems:**
> "QMS document RAG — SOPs, work instructions, ISO standards — has a strong procedural structure. You might think chunking by a fixed token count is fine since it's procedural, formulaic text — it isn't: the numbered section hierarchy (1.0, 1.1, 1.2...) is itself the retrieval structure, and a fixed-size chunk that cuts across a section boundary loses the exact procedure step an auditor needs intact. So chunking follows that hierarchy instead. BM25 for part numbers, process IDs, revision numbers. Dense for 'how do I perform X operation' queries. The key governance requirement: version control matters enormously — an employee finding an outdated SOP is a non-conformance event — so metadata filtering by revision status (active/superseded) and effective date is non-negotiable."

**Customer Service Knowledge Base:**
> "Consumer-facing knowledge base RAG has the tightest latency budget — 1 second or under. You might think a cross-encoder reranker is always worth adding since it reliably improves precision — here it isn't: a full reranker pass alone can cost 300ms or more, which blows the budget before it's even bought you anything. So I'd typically skip it or use a very small one (ms-marco-MiniLM), lean on a strong hybrid retrieval setup, and invest quality effort at the chunking layer instead of the retrieval layer. Fallback routing to a human agent when confidence is low is standard here."

---

### Life Sciences — Ideas and Talk Track

**Best project ideas:**

1. **Clinical Trial Protocol Q&A** — Public trial protocols from ClinicalTrials.gov (NCT numbers, eligibility criteria, endpoints, phase). Demonstrates: complex structured document parsing, exact NCT number retrieval (BM25), semantic eligibility criteria matching, citation required for regulatory context. High value signal: clinical trials folks spend enormous time searching protocol libraries.

2. **FDA 510k / PMA Submission Search** — All public on FDA.gov. Class II/III medical device submissions. Demonstrates: regulatory document ingestion, multi-document Q&A ("how have other manufacturers addressed sterilization validation for this device class?"), exact predicate device retrieval.

3. **Drug Label / Prescribing Information (openFDA)** — *Already partially built in rag-eval-harness.* Extend: add Qdrant comparison, add self-query for drug class/indication/contraindication filtering, add a proper eval harness using RAGAS.

4. **Pharmacovigilance FAERS Signal Detection** — FDA Adverse Event Reporting System is public. RAG over adverse event narratives + structured signal detection. Very high signal for pharma/biotech roles.

**Life Sciences talk track:**
> "Life sciences is one of the most demanding RAG environments because the document types are radically heterogeneous — clinical trial protocols, drug labels, FDA submissions, peer-reviewed literature, pharmacovigilance reports — and the accuracy bar is very high given regulatory stakes. For a clinical trial team using RAG over their protocol library, I'd prioritize: exact NCT number retrieval via BM25, semantic eligibility criteria matching for patient screening, self-query to filter by therapeutic area, phase, and indication. You might think single-pass retrieve-then-generate is enough since each protocol is a self-contained document — it isn't for the hardest real question in this domain: 'how do similar trials handle the primary endpoint design for this indication?' requires retrieving from multiple protocols and synthesizing across them, which is exactly where agentic RAG with multi-document agents starts making sense over a fixed single-pass pipeline."

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
> "Take a real query against a PBM formulary: 'what's the 2024 GLP-1 coverage for a diabetic patient?' A production RAG prompt handling that has four mandatory sections. The system prompt establishes the role and citation requirement — 'Answer ONLY using the provided context. For every factual claim, cite the document and section. If context is insufficient, say so explicitly. Do not use general knowledge.' Then the retrieved context — the actual 2024 formulary chunks — with explicit document and section labels so every chunk has a citation anchor. Then the user query, structurally separate from the system prompt — never concatenated into it. And critically, the output format section — a JSON schema with answer, sources with doc_id and section and page, and a confidence field. You might think a well-written system prompt alone is enough, since it explicitly instructs the model to cite its sources — it isn't sufficient on its own: without the structured output schema there's no programmatic way to verify what it actually cited, run a faithfulness check against it, or log it for audit. That output section is the most frequently skipped part of the prompt and the most consequential for production governance."

### On how citations actually happen — a mechanism, not a feature
> "There's no single API call or 'citations mode' that gives you this — it's an architecture spanning three layers, and I'd walk through it that way if asked. First, at ingestion: doc_id, section, and page get extracted as metadata on the chunk, not just its text — that's the manifest-building step from Layer 1. Second, at retrieval: that metadata has to ride along as payload on every returned chunk, not get stripped down to bare text before it reaches the prompt. Third, at generation: the prompt labels each chunk in context with its citation anchor — 'Document: Formulary 2024, Section 3.2' — and the output is constrained into a structured schema, typically via tool-use or JSON-schema-enforced structured output, with a sources field listing doc_id, section, and page per claim. You might think returning a list of the source documents alongside the answer is sufficient — it isn't, because a reviewer needs to know which specific sentence in the answer maps to which specific chunk, not just that the answer drew from this set of five documents somewhere. If I want citations I can actually trust, not just citations the model claims, I add a fourth layer: a faithfulness or NLI check that verifies the cited chunk actually contains the text supporting that claim before the response goes out."

---

### On faithfulness vs correctness — the key distinction
> "Faithfulness and correctness sound like the same thing, but they're not — and the distinction matters in production. Faithfulness is precision: every claim in the answer is supported by the retrieved context. Correctness is accuracy: the answer is actually true in the world. Faithfulness is measurable at runtime — you compare the answer to the chunks you retrieved, no ground truth needed. Correctness requires ground truth labels — you can't check it live. In production, faithfulness is your hallucination detection signal."

> "The failure case that makes this concrete: user asks what dairy products are covered. Retrieved context says milk, cheese, yogurt. Model answers: milk, cheese, yogurt, and tofu as a non-dairy alternative. You might think that's a fine, even helpful answer, since tofu-as-a-dairy-alternative is a true fact about the world — it's still a faithfulness failure, because tofu is not in the retrieved context; the model pulled it from training weights because tofu appears near 'dairy alternatives' in its training data. In a regulated industry, parametric knowledge like that is potentially outdated, unverifiable because there's no citation path, and may directly contradict your organization's specific policies. The system prompt tells the model not to use general knowledge; the faithfulness check detects when it does anyway."

---

### On LLM-as-judge deployment patterns
> "There are four ways to deploy LLM-as-judge in production, and the right choice depends on stakes and latency tolerance. Offline only — you run it against a test dataset before deploying a new retrieval strategy, catching faithfulness regressions before they hit users. Shadow or async — you return the response immediately, run the faithfulness check in parallel, log results, and alert if the failure rate exceeds a threshold; no latency impact, but you can't stop a bad response before the user sees it. You might think shadow/async is always the right default since it's free in latency terms — it isn't, for something like the clinical formulary answer above: by the time the async check catches a faithfulness failure, the patient-facing answer has already gone out, which is exactly the scenario that forces blocking evaluation instead. Blocking — you run the faithfulness check before returning to the user; if it fails, you trigger a CRAG loop or return a fallback, at a cost of 300 to 500 milliseconds. The CRAG loop itself: generate, evaluate, pass returns the answer, fail reformulates the query and re-retrieves, and after two or three retries you return an explicit fallback rather than a wrong answer. Always cap retries — without a cap, a query that consistently fails faithfulness can loop indefinitely and burn your token budget."

> "What does the user see when faithfulness fails? An explicit fallback: 'I couldn't find sufficient information in our documentation to answer this accurately.' Not 'your response evaluated as unfaithful.' The evaluation is an internal quality gate. The failure is logged for your observability dashboard — failure rates, which query types fail most, retrieval quality trends — but that's all backend. The user sees either a validated answer or a graceful fallback."

---

### On NLI vs LLM-as-judge — volume-based selection
> "LLM-as-judge is thorough but expensive — 300 to 800 milliseconds, full model inference per query. NLI — Natural Language Inference — is a small fast classifier, 10 to 50 milliseconds, that categorizes each sentence as entailed, contradicted, or neutral by the context. At Google AI Overviews scale — millions of queries per day — you run NLI only; LLM-as-judge per query isn't economically viable. You might think that same lightweight NLI-only approach is the responsible choice everywhere, since it's cheaper and still catches contradictions — it isn't right for an enterprise clinical tool running a few thousand queries a day, where the stakes justify paying for blocking LLM-as-judge instead. The interesting middle ground is using NLI as a router: if NLI scores HIGH confidence entailed, return directly. If NLI is uncertain, escalate to LLM-judge async and flag for review if it fails. You get speed for the easy cases and thoroughness for the ambiguous ones."

---

### On evals ownership and the production handoff point
*(New convention — Director + Principal/Staff registers, per CLAUDE.md's session template.)*

**Director framing:**
> "In production, my ownership boundary was consistently build-to-SME-validation, not the long-run live metric. The domain team held the ground truth needed to grade real answers, so eval ownership transferred at handoff by design, not because of a gap in my process. You might think that means I can't speak to evals — it doesn't; what I own is making sure a system is measurably ready to hand off, and closing my own blind spots proactively rather than waiting for someone to assign that work. That's why I built a real recall@k/MRR and LLM-judge faithfulness harness in my own portfolio work, specifically to have first-hand fluency with the eval mechanics my day-to-day handoff model never required me to operate live."

**Principal/Staff framing:**
> "Precision and recall are the two failure modes underneath every retrieval decision — precision is 'of what I returned, how much was actually right,' recall is 'of everything relevant, how much did I find' — and which one you protect changes the architecture: reranking depth, confidence thresholds, and fallback triggers all trace back to that one choice. On RAGAS specifically, since it comes up directly: I evaluated it and passed, for two concrete reasons — it's OpenAI-coupled and needs a custom LLM wrapper to run against Claude, and it assumes ground-truth answers I didn't have for this corpus. So in rag-eval-harness I hand-rolled a two-layer harness instead: recall@k and MRR against a gold retrieval set for the retrieval side, and an LLM-as-judge scoring faithfulness, relevance, and citation accuracy for the generation side. That let me demonstrate I understand what the eval is actually measuring, not just that I can call a library."

---

### On prompt injection defense
> "Prompt injection is OWASP LLM Top 10 number one — and the more dangerous form in enterprise RAG isn't a user trying to override your system prompt. It's indirect injection: a document in your corpus that contains injection strings. When that document gets retrieved and injected into context, those strings run. A policy document that says 'Ignore previous instructions' in its text will pass right through retrieval and into your prompt assembly. You might think a strong system prompt telling the model to disregard any instructions found inside retrieved content is enough defense — it isn't reliable on its own, which is why sanitization strips known injection patterns from chunk text before it ever reaches the prompt, rather than trusting the model to resist them live. Defense in layers: structural separation first — never concatenate user input into the system prompt string; use separate API roles so the model treats them at different trust levels. Input validation classifier on user queries. Chunk sanitization on retrieved documents before context assembly. Scope enforcement — a fast topic classifier that checks whether a query is even within your domain before it reaches retrieval. And canary tokens in the system prompt: a hidden phrase that, if it appears in the model's output, tells you the system prompt was likely leaked."

---

### On PHI handling — three-point scrubbing architecture
> "In a HIPAA context, PHI scrubbing isn't a single step — it's three points, and each one catches a failure the others miss. You might think scrubbing the user's typed query is enough, since that looks like the obvious PHI entry point — it isn't the only one: a retrieved clinical guideline chunk can itself contain a real patient case study with embedded PHI that was never in the user's question at all, so context scrubbing before chunks are injected into the prompt is a separate, necessary step. And even with both of those clean, the model can still surface PHI in its own generated output — pulled from context it saw, or occasionally hallucinated — so output scrubbing before the response is returned is the third, independent point. The tool I reach for is Microsoft Presidio — open source, detects 40-plus entity types including SSNs, MRNs, dates, and names. AWS Comprehend Medical and Azure AI Language are the managed alternatives. Three points. Not one, not two."

---

### On audit logging in regulated AI systems
> "In a HIPAA-regulated AI system, the audit log is as important as the application itself. You might think logging the user's raw query is the most useful audit record, since it captures exactly what was asked — it's actually the wrong move: logging the raw query turns your audit log itself into a PHI data store, which is precisely the thing you're trying to control. So what gets logged is the PHI-scrubbed version of the query, plus user identity, timestamp, the chunk IDs that were retrieved, the generated response, token count and cost, and whether any guardrails fired. The log is immutable and append-only. HIPAA minimum retention is six years. And you log access to the audit log itself — who looked at the audit trail is itself auditable. I've built this directly in my RxSense MCP server — RBAC controls who can invoke which tools, every invocation is logged, and token spend is tracked per user."

---

### On NIST AI RMF — mapping governance to production proof points
> "When people ask how I think about AI governance at the enterprise level, I map it to NIST AI RMF's four functions. Govern: policies and accountability — who owns AI risk decisions, who approved the system. In my RxSense work, that's RBAC and SSO defining which teams can access which AI capabilities. Map: identify the specific risks for this use case — for clinical RAG, PHI exposure and hallucination risk drove the architecture. Measure: quantify and monitor those risks — audit logs, token spend dashboards, guardrail trigger rates, faithfulness failure rates. Manage: the controls and incident response — PHI scrubbing at three points, token hard stops, CRAG fallbacks, model versioning controls. Most candidates know LLM techniques. Almost none can articulate governance at the RMF level. That's the asymmetry."

---

### On multi-agent terminology (when asked to distinguish tools from agents)
> "Take my own mediaguide-langgraph project: a tool in it is a deterministic function — search_database(), read_file() — no LLM inside, no decision-making, it executes and returns. An agent is the LLM-backed layer that decides which tool to call and when, with its own context and system prompt. LangGraph defines the agents and the edges between them at design time — that's static topology, and it's the pattern I used there: the architecture enforces scope structurally, no edge means the action is literally impossible. You might think a more 'agentic' system that dynamically spawns new agent instances at runtime is strictly more capable — it costs you two things static topology gives you for free: observability, because a dynamically spawned agent doesn't automatically inherit its parent's trace context, and cost governance, because you can't pre-define a token budget for an agent that doesn't exist until runtime. A system is agentic when a single LLM makes decisions about control flow across multiple steps, and multi-agent when two or more LLM-backed agents interact, each with independent context and reasoning — but the static-vs-dynamic distinction is the one I'd lead with in a regulated or budget-constrained production system."

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

*Updated: 2026-07-25 — Session 1 (All 5 Layers complete, 2026-07-22) + Q&A correction pass + domain/need/solution/proxy-contrast rewrite*
