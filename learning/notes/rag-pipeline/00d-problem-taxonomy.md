# Document-RAG Problem Taxonomy — Diagnose the Domain in 10 Seconds

*Built 2026-08-02, during the oil-gas-compliance-rag portfolio build. Purpose: "Agentic
RAG" describes an architecture pattern, not a problem — it tells an interviewer nothing
about whether you actually understand the domain in front of you. This file is the
vocabulary that replaces it: eight named failure classes almost every document-RAG system
lives or dies on, plus which ones dominate in the domains most likely to come up (clinical,
oil & gas, historical archives, banking, family law, research papers). Naming the axis
*is* naming the architecture — "perception problem, needs a VLM not a retrieval redesign"
explains more in one sentence than "agentic RAG" explains in five.*

---

## The core taxonomy — 8 named problem classes

Almost every document-RAG system is hard because of some combination of these. Learn to
diagnose which ones dominate for a given domain, and you can speak to any use case cold.

1. **Perception / extraction fidelity** — can you reliably get correct text out of the
   source at all? Scanned/faxed/handwritten, faded, crooked, mixed digital-native +
   scanned corpora. Solved with OCR model choice (Tesseract vs. a VLM like Claude/GPT-4V
   for degraded pages), not retrieval architecture.
2. **Structural/layout parsing** — even with perfect OCR, do you preserve tables, forms,
   multi-column reading order, hierarchy? A different failure mode than #1 — the
   characters are right, the *shape* is destroyed (a 2D table flattened into row-soup).
3. **Precision retrieval / exact-match & citation** — codes, section numbers, IDs, docket
   numbers that embeddings are bad at and lexical search (BM25/SPLADE) is good at, plus a
   hard requirement to cite the exact source, not a paraphrase.
4. **Recency & supersession** — near-duplicate documents across time; only the current one
   should surface. The dangerous failure mode is silent — a confident, fluent, *outdated*
   answer, not an obvious error.
5. **Jurisdiction / applicability scoping** — same topic, different rules depending on
   who/where/what regime applies. Needs self-query filtering with hard boundaries, because
   a wrong-jurisdiction answer is often worse than no answer.
6. **Cross-document / multi-hop reasoning** — the answer isn't in one chunk; it requires
   resolving a citation, a reference, or synthesizing across documents that point at each
   other.
7. **Faithfulness, abstention & escalation** — when the system should say "I don't know" or
   route to a human instead of generating something plausible-sounding. This is a design
   decision, not a metric you bolt on after.
8. **Privacy, governance & access control** — PHI/PII scrubbing, RBAC, audit logging, data
   residency (can this even touch a third-party API). A separate axis from retrieval
   quality entirely — it's "can this system legally exist."

Two more worth having in your pocket — less universal, but decisive in specific domains:

- **Numerical/tabular reasoning** — aggregation or computation over retrieved numbers (not
  just "find the right sentence").
- **Corpus heterogeneity from consolidation** — when an organization grew by M&A, every
  acquired entity's records use different legacy conventions that never got unified.

---

## Applying it — which axes dominate where

| Domain | Dominant axes | Why |
|---|---|---|
| Clinical claims | Jurisdiction/versioning, precision/citation, privacy, cross-document | Payer-specific policy, exact codes (CPT/ICD-10/NDC), PHI, claim→policy→medical-necessity-criteria chains |
| Drug labels | Precision/citation, recency, structural/layout | Rigid FDA-mandated structure, dosing/contraindication must be exact, labels get amended |
| Research papers | Cross-document (citation graph), numerical/tabular, recency-of-claims | Findings only mean something in context of what they cite/refute; results live in tables, not prose |
| Oil & gas regs | Jurisdiction, recency, precision/citation, numerical/tabular | Federal/state split, amendment cycles, section citations, engineering threshold tables |
| Historical/scanned archives | Perception, structural parsing | Scanned/handwritten/faded, hundreds of table formats across eras — low stakes, so precision matters less |
| Banking (consumer + compliance) | Perception+structural (consumer docs), jurisdiction/versioning (compliance), faithfulness/abstention, privacy, scale | Two sub-problems in one industry — see below |
| Energy field records | Perception, corpus heterogeneity | Decades-old field records, M&A-driven record-system diversity |
| Family law | Jurisdiction/versioning, precision/citation (hard abstention), privacy, numerical | State/county-specific law, sanctionable hallucinated-citation risk, custody/support sensitivity, formula-driven support calculations |

*(Table cells stay terse on purpose — the study app's responsive-table renderer extracts
plain text only from table cells, no nested lists or bold survive it. The worked example
per axis lives in the bulleted sections below instead, where real markdown lists render
correctly on both desktop and the mobile stacked-card view.)*

### Clinical claims
- **Jurisdiction/versioning:** the same CPT code can require prior authorization under a
  PPO plan but not an HMO plan from the same insurer, and the rule set updates quarterly.
- **Precision/citation:** claim adjudication hinges on an exact ICD-10 diagnosis code paired
  with an exact CPT procedure code — "diabetes" isn't a queryable concept, E11.9 is.
- **Privacy:** every retrieved chunk *and* every generated answer has to pass through PHI
  scrubbing (e.g. Presidio) before it's logged or displayed, not just the initial query.
- **Cross-document:** a denial decision requires chaining claim → coverage policy →
  medical necessity criteria → prior clinical documentation, not a single-document lookup.

*[Personal: this is the RxSense/PBM formulary shape directly — see
`../../talk-tracks/rag-pipeline.md` for the existing NDC/ICD-10 precision talk track this
extends.]*

### Drug labels
- **Precision/citation:** dosing and contraindication text must be quoted exactly as
  FDA-approved label language — a paraphrase that drops a black-box warning is a
  patient-safety failure, not a style issue.
- **Recency:** a label update (e.g. a new boxed warning) supersedes the prior version
  instantly — serving stale label text is the single most dangerous failure mode in this
  domain.
- **Structural/layout parsing:** labels follow a mandated section structure (Indications
  and Usage, Dosage and Administration, Contraindications, etc.) — chunking has to respect
  those section boundaries, not just token counts.

### Research papers
- **Cross-document (citation graph):** a finding only means something in context of what it
  supports, contradicts, or was later refuted by — flat semantic retrieval over abstracts
  misses that entirely.
- **Numerical/tabular:** the actual result usually lives in a table (effect size, p-value,
  sample size, confidence interval) — comparing findings across five papers means
  extracting and normalizing numbers from five differently-formatted tables, not embedding
  prose.
- **Recency, at claim level not document level:** a 2015 finding can be contradicted by a
  2023 replication without the original paper ever being retracted or flagged
  "superseded" — supersession has to be tracked per-claim, not per-document.

*[Personal: this is the shape of the research-paper reading app idea — the differentiator
over a generic "chat with PDFs" tool is exactly these two axes (citation-graph traversal +
numeric claim extraction), not a bigger context window. GROBID is the standard tool for
academic-PDF structural parsing if this gets built.]*

### Oil & gas regulatory compliance
- **Jurisdiction:** an interstate pipeline (Houston to Ohio) is governed uniformly by
  federal PHMSA safety rules the whole route, while a purely intrastate segment falls under
  state authority (Texas RRC, Ohio PUCO) — routing has to know which regime actually
  applies, not just detect the word "pipeline." FERC is a third, separate regulator —
  it certificates *construction* of interstate gas pipelines and handles economic/rate
  regulation, it does not write pipeline safety code.
- **Recency:** the same CFR section (e.g. §192.607) recurs nearly unchanged across multiple
  annual editions with a small amendment buried in one clause — retrieval has to prefer the
  current edition even though a stale one sits right next to it in embedding space.
- **Precision/citation:** a compliance answer has to cite the exact subsection
  (§192.607(a)), not "somewhere in Part 192" — that's the difference between an
  audit-defensible answer and a liability.
- **Numerical/tabular:** in-line inspection intervals are defined in a cross-tabbed table
  (pipe size × pressure × SMYS % × location class) — a real query needs correct table-cell
  lookup, not paragraph retrieval.

*[Personal: this is the live build — `oil-gas-compliance-rag` in the portfolio, built
directly against real 49 CFR Parts 192/195 (4 editions, for the recency fixture) and real
Texas RRC Chapter 8 text (for the jurisdiction + table-extraction problem, plus its 94
explicit cross-references back into the federal CFR — a genuine multi-hop case, not a
contrived one). PHMSA/Energy Transfer/FERC background.]*

### Historical/scanned archives
- **Perception:** a 1970s gamebook scan has faded ink, tally marks standing in for numbers,
  and OCR that hallucinates characters on degraded pages — the retrieval architecture is
  irrelevant if the extraction step invents a stat.
- **Structural parsing:** box score table formats changed dozens of times across five
  decades of gamebooks — there's no single schema to parse toward, so extraction has to be
  era-aware, not template-based.

*[Personal: mediaguide-langgraph + gamebook-langgraph projects in the portfolio.]*

### Banking — two distinct sub-problems in one industry
- **Perception + structural (consumer document intake):** a loan applicant's
  phone-photographed pay stub arrives crooked, partially shadowed, and in one of a hundred
  different employer payroll formats — the same extraction-fidelity problem as a scanned
  1970s archive, just arriving at production consumer volume instead of a fixed archive.
- **Jurisdiction/versioning (compliance):** guidance has to reflect OCC/Fed/CFPB federal
  rules plus state-specific banking law plus internal policy on its own update cadence —
  and the version in effect *at the moment of the customer interaction* is what gets
  audited, not the current version.
- **Faithfulness/abstention:** a support chatbot inventing an account policy isn't an
  embarrassing hallucination, it's a CFPB exam finding — the system has to fail closed and
  escalate rather than guess.
- **Privacy:** retrieval has to be strictly scoped per customer account — no per-tenant
  isolation is a cross-account data leak waiting to happen.
- **Scale:** this runs at millions-of-documents production volume with a real latency SLA,
  not a curated thousand-document eval corpus — architecture choices that work at demo
  scale can fall over here.

### Energy sector field records
- **Perception:** decades-old field inspection logs are handwritten, faxed-then-scanned
  (double image degradation), and inconsistently legible — the same extraction-fidelity
  problem as historical sports archives, applied to safety-critical infrastructure records.
- **Corpus heterogeneity from consolidation:** a pipeline operator that grew by acquisition
  inherits a different record-keeping convention from every acquired company — there's no
  single legacy schema to normalize toward, only a consolidation problem to solve
  document-by-document.
- Related, worth verifying the exact citation before stating it precisely in an interview:
  PHMSA's post-San Bruno "traceable, verifiable, and complete" (TVC) records requirement
  for pipe material documentation is the named regulatory consequence of exactly this
  perception + heterogeneity problem.

### Family law
- **Jurisdiction/versioning:** custody and support law is set state-by-state and often
  further refined by county/circuit local rules — the same fact pattern can have a
  different correct answer one county over.
- **Precision/citation, with hard abstention:** multiple real attorneys have been
  sanctioned in court for filing AI-hallucinated case citations — this is the domain where
  "never state a citation you can't point to a retrieved source for" stops being a best
  practice and becomes the entire design constraint.
- **Privacy:** case files involve custody, abuse allegations, and minors' records — among
  the highest-sensitivity content categories in any RAG system, with redaction and access
  control as a first-class requirement, not an add-on.
- **Numerical:** child support calculation is a jurisdiction-specific formula applied to
  retrieved income guideline tables — the hard part is correct table lookup and
  arithmetic, not text generation.

---

## Why this works rhetorically

"Agentic RAG" describes an architecture pattern with zero information about what problem it
solves. Each of the 8 terms above implies a falsifiable technical decision: perception → OCR/
VLM choice; jurisdiction → self-query filter design with hard boundaries; precision/citation →
BM25/SPLADE + constrained citation generation; faithfulness → an explicit escalation policy,
not a metric bolted on after. Naming the axis *is* naming the architecture.
