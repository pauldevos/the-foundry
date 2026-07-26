# Databricks AI Platform — What's New (mid-2025 → July 2026)

*Read this the night before and morning of. Goal: sound current, not stale, on a stack Paul
knows the fundamentals of (Delta Lake, notebooks, clusters, Spark, core Unity Catalog,
MLflow tracking) but hasn't touched in the last 6-12 months.*

---

## Say this if asked to describe Databricks' current AI platform in one breath

"Databricks has spent the last year turning the lakehouse into a governed agent platform,
not just a data platform: Agent Bricks (built on Mosaic AI) is now the GA layer for
building and evaluating agents against any model and any framework — LangGraph, CrewAI,
your own harness — while Unity Catalog has grown from governing tables to governing
models, agents, MCP tools, and skills through a new Unity AI Gateway; Vector Search was
renamed AI Search and gained native hybrid (BM25 + dense) retrieval; MLflow 3 became a
GenAI-native tracing and LLM-judge evaluation layer; and Lakebase — a serverless
Postgres-compatible OLTP database with pgvector — shipped to close the gap between
transactional apps and the lakehouse. Databricks itself quietly retired DBRX and stopped
trying to be a model vendor — it's positioning itself as the neutral governance and
orchestration layer sitting on top of whichever frontier models a customer chooses."

---

## Sources (all official Databricks docs/blog, checked July 2026)

- [Agent Bricks: Data + AI Summit 2026](https://www.databricks.com/blog/agent-bricks-dais-2026)
- [Agent Bricks: The governed enterprise agent platform](https://www.databricks.com/blog/agent-bricks-governed-enterprise-agent-platform)
- [What is AI Agent Evaluation?](https://www.databricks.com/blog/what-is-agent-evaluation)
- [Announcing Mosaic AI Agent Framework and Agent Evaluation](https://www.databricks.com/blog/announcing-mosaic-ai-agent-framework-and-agent-evaluation)
- [MLflow 3.0: Build, Evaluate, and Deploy Generative AI with Confidence](https://www.databricks.com/blog/mlflow-30-unified-ai-experimentation-observability-and-governance)
- [MLflow 3 for GenAI docs](https://docs.databricks.com/aws/en/mlflow3/genai/)
- [Databricks AI Search docs](https://docs.databricks.com/aws/en/ai-search/ai-search)
- [Integrate Unity Catalog tools with third-party GenAI frameworks](https://docs.databricks.com/aws/en/agents/agent-framework/unity-catalog-tool-integration)
- [What's new with Unity Catalog at Data + AI Summit 2026](https://www.databricks.com/blog/whats-new-unity-catalog-data-ai-summit-2026)
- [AI governance at Data + AI Summit 2026: Unity AI Gateway](https://www.databricks.com/blog/ai-governance-data-ai-summit-2026-whats-new-unity-ai-gateway)
- [Lakebase Postgres docs](https://docs.databricks.com/aws/en/oltp/)
- [Azure Databricks Lakebase is Generally Available](https://www.databricks.com/blog/azure-databricks-lakebase-generally-available)
- [Databricks Lakebase is now Generally Available (community/AWS GA thread)](https://community.databricks.com/t5/announcements/databricks-lakebase-is-now-generally-available/td-p/147678)
- [What happened to Delta Live Tables (DLT)?](https://docs.databricks.com/aws/en/ldp/concepts/where-is-dlt)
- [Databricks Launches Genie One press release](https://www.databricks.com/company/newsroom/press-releases/databricks-launches-genie-one-all-new-agentic-coworker-every-team)
- [Databricks One is now Genie (community writeup)](https://community.databricks.com/t5/mvp-articles/databricks-one-is-now-genie/td-p/155665)
- [Databricks platform release notes — April 2025 (DBRX retirement)](https://docs.databricks.com/aws/en/release-notes/product/2025/april)
- [Databricks-hosted foundation models — Foundation Model APIs](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models)
- [Databricks platform release notes — June 2026 (AI Functions GA)](https://docs.databricks.com/aws/en/release-notes/product/2026/june)

---

## Tier 1 — most likely to come up

### Agent Bricks (Mosaic AI's evolution into a full agent platform)
**What it is:** The successor to "Mosaic AI Agent Framework" — Databricks' end-to-end
surface for building, deploying, and governing agents. At Data + AI Summit 2026 it was
reframed around three pillars: **Choice** (any frontier model — OpenAI, Anthropic, Gemini,
Qwen, Kimi — plus a new SpaceX partnership bringing Grok models natively into Databricks),
**Context** (MCP integration, a "Genie Ontology" for business semantics, UC-governed
Databricks Agent Tools, an agent memory service backed by Lakebase), and **Control**
(Unity AI Gateway, agent tracing, sandboxed code execution). Over 100K agents have been
built on it, per Databricks' own numbers. **Source:** [Agent Bricks DAIS 2026](https://www.databricks.com/blog/agent-bricks-dais-2026), [governed platform post](https://www.databricks.com/blog/agent-bricks-governed-enterprise-agent-platform).
**What problem it solves:** Building an agent used to mean stitching together a framework,
a vector store, an eval harness, and a governance layer yourself. Agent Bricks packages
all four with Databricks-native identity/permissions baked in — agents run under
on-behalf-of user tokens rather than a shared service account.
**How it connects to RAG/agentic work:** It explicitly supports running *your* harness
inside it — LangGraph, CrewAI, Agno, Claude Code SDK, OpenAI Agent SDK are all named as
supported "harnesses," plus a managed version of the open-source meta-harness Omnigent. So
this isn't a replacement for LangGraph — it's a governed runtime you can point your
existing LangGraph graph at.
**Key tradeoff vs. LangGraph/AutoGen run on your own infra:** Agent Bricks buys you
built-in governance, tracing, and memory (via Lakebase) with near-zero plumbing — at the
cost of running inside Databricks' security/compute boundary. A self-hosted LangGraph +
Chroma/Qdrant + custom RBAC stack is fully portable across clouds but you own every piece
of observability, access control, and audit logging yourself. If the company is
Databricks-native, Agent Bricks is the "why would we build this ourselves" answer;
if multi-cloud portability matters more than governance convenience, that's the case for
staying framework-native.

### Agent Evaluation / the CLEARS framework
**What it is:** Databricks' built-in LLM-as-judge evaluation layer for agents, now
standardized around six dimensions — **C**orrectness, **L**atency, **E**xecution,
**A**dherence, **R**elevance, **S**afety (CLEARS) — scored automatically after every agent
session and logged to MLflow/Unity Catalog. **Source:** [Agent Bricks governed platform post](https://www.databricks.com/blog/agent-bricks-governed-enterprise-agent-platform), [What is AI Agent Evaluation?](https://www.databricks.com/blog/what-is-agent-evaluation).
**What problem it solves:** Multi-step agent trajectories (planning → tool calls →
reasoning → final answer) aren't scoreable with single-turn eval metrics. CLEARS
standardizes what "good" means across correctness *and* operational dimensions (latency,
safety) so eval isn't just "did it get the right answer."
**How it connects to RAG/agentic work:** This is Databricks' answer to the LLM-as-judge +
custom rubric pattern Paul already knows from RAGAS/DeepEval — same underlying idea
(natural-language rubrics, ensemble judges, alignment tuning against human-labeled data via
"review apps"), just wired natively into MLflow traces and Unity Catalog lineage instead of
a standalone eval library.
**Key tradeoff vs. RAGAS/DeepEval:** CLEARS/Agent Evaluation is deeply integrated — traces,
lineage, and governance all connect automatically — but it's Databricks-managed only (the
newest eval suite is not yet available in open-source MLflow per Databricks' own docs).
RAGAS/DeepEval are portable across any stack and fully inspectable/open, but you build the
tracing-to-eval-to-governance pipeline yourself. For an interview answer: "same
LLM-as-judge philosophy I already use, Databricks just gives you the six-dimension rubric
and the plumbing for free if you're already on their platform."

### MLflow 3 for GenAI (tracing + evaluation)
**What it is:** MLflow 3 was rebuilt around GenAI as a first-class citizen: real-time trace
logging of prompts/retrievals/tool calls/latency/cost, built-in and custom LLM-judge
scorers, human feedback collection via "review apps," and production monitoring — not just
experiment tracking anymore. **Source:** [MLflow 3.0 blog](https://www.databricks.com/blog/mlflow-30-unified-ai-experimentation-observability-and-governance), [MLflow 3 for GenAI docs](https://docs.databricks.com/aws/en/mlflow3/genai/).
**What problem it solves:** Classic MLflow tracked model training runs. It had no concept
of a multi-hop RAG/agent trace. MLflow 3 adds automatic instrumentation across many
frameworks so a trace captures the whole retrieval-then-generation (or full agent) path,
not just the final model call.
**How it connects to RAG/agentic work:** This *is* the observability layer under Agent
Bricks and CLEARS — traces feed the judges, judges feed the dashboards, dashboards feed UC
lineage. If Paul is asked "how would you monitor a RAG pipeline in production on
Databricks," this is the literal answer.
**Key tradeoff vs. RAGAS + a custom observability stack (LangSmith, Arize, etc.):** MLflow
3's GenAI evaluation suite is Databricks-managed-only right now (open-source support is
described as "coming soon," per Databricks' own docs) — so on Databricks it's the path of
least resistance, but it's not yet a fully portable open-source alternative to
LangSmith/Arize if the company later goes multi-cloud.

### Databricks Vector Search → renamed Databricks AI Search
**What it is:** Vector Search was renamed **AI Search** and gained native **hybrid search**
— vector similarity (HNSW) combined with keyword/BM25 in one call, fused via Reciprocal
Rank Fusion, with an optional reranking step. It's queryable straight from SQL via the
`vector_search()` function (Public Preview as of June 2026). **Source:** [Databricks AI Search docs](https://docs.databricks.com/aws/en/ai-search/ai-search).
**What problem it solves:** Previously hybrid search meant DIY-ing BM25 + dense fusion
yourself (exactly the pgvector pain point Paul already knows). AI Search now does the fused
retrieval in a single managed call, plus automatic sync pipelines that keep the index
current as source Delta tables change (embedding generation, retries, batch sizing,
autoscaling all managed).
**How it connects to RAG/agentic work:** This is the retrieval layer in a Databricks-native
RAG stack: Delta table → AI Search index (auto-synced) → hybrid retrieval → Model Serving
for generation, all governed by Unity Catalog. It's the direct Databricks-ecosystem
equivalent of the ingestion → index → retrieve pipeline Paul already knows cold.
**Key tradeoff vs. Qdrant/Weaviate/pgvector:** AI Search gives you zero-infra hybrid search
with governance inherited automatically from Unity Catalog (index-level ACLs, lineage,
audit) — but it only exists inside Databricks; you can't run it against data outside the
platform, and index tuning is less granular than Qdrant/Weaviate's own HNSW parameter
control. pgvector remains the cheapest/simplest option if the team is already
Postgres-native and doesn't need managed sync/autoscaling; Qdrant/Weaviate remain the
choice when portability across clouds or fine-grained index control matters more than
platform-native governance.

### Unity Catalog Functions/Tools for agents
**What it is:** Any SQL or Python User-Defined Function registered in Unity Catalog can be
exposed directly as an agent tool — callable from LangChain, LangGraph, OpenAI, or
Anthropic agent code via the `unitycatalog-ai` package (`pip install unitycatalog-ai[databricks]`).
Requires Databricks Runtime 15.0+, Python 3.10+, serverless compute for production use.
**Source:** [Integrate Unity Catalog tools with third-party GenAI frameworks](https://docs.databricks.com/aws/en/agents/agent-framework/unity-catalog-tool-integration).
**What problem it solves:** Tool definitions in most agent frameworks live as ad hoc Python
functions with no central registry, versioning, or access control. Registering a tool as a
UC function means it's discoverable, permissioned, lineage-tracked, and reusable across
every agent in the org — the same governance model as a table.
**How it connects to RAG/agentic work:** This is Databricks' answer to "how do you govern
what tools an agent is allowed to call" — instead of a bespoke tool-permissions layer you'd
build by hand around LangGraph, the permission check is just a Unity Catalog grant.
**Key tradeoff vs. a custom tool registry + generic RBAC:** UC-registered tools get
governance, auditing, and lineage for free the moment they're created — but the tool logic
is now living as a Databricks SQL/Python UDF, which is less portable if the agent later
needs to run outside Databricks. A hand-rolled tool registry is fully portable but you
build and maintain the access-control and audit layer yourself — exactly the tradeoff
Paul already reasons about with generic RBAC vs. governed metadata stores in his RAG work.

### Unity AI Gateway
**What it is:** An extension of Unity Catalog announced at DAIS 2026 that governs *runtime*
AI behavior, not just static assets: models (Databricks-hosted and external), MCP services,
agents, and "skills" can all be registered, discovered, and audited the same way tables are.
Adds **Contextual Service Policies** (Beta) to allow/deny/require-approval for specific
agent actions, hard spend caps across external model providers, and unified agent tracing
piped into Databricks' SIEM (Lakewatch). **Source:** [Unity AI Gateway DAIS 2026](https://www.databricks.com/blog/ai-governance-data-ai-summit-2026-whats-new-unity-ai-gateway), [Unity Catalog DAIS 2026](https://www.databricks.com/blog/whats-new-unity-catalog-data-ai-summit-2026).
**What problem it solves:** As agents call multiple models, tools, and external MCP
servers, "who can call what, and what did it actually do" stops being answerable by table
grants alone. Unity AI Gateway is the control plane for that expanded surface.
**How it connects to RAG/agentic work:** This is the direct analog to the governance
frameworks Paul already talks about for PHI/regulatory RAG — Unity AI Gateway is Databricks
packaging "who can invoke this model/tool, log everything, cap the blast radius" as a
platform primitive instead of something you build around LangGraph yourself.
**Key tradeoff vs. generic RBAC + a hand-built audit log:** Native, governed, and unified
across model/tool/agent calls in one place — but it only governs what happens inside (or
routed through) Databricks. A healthcare client running agents partly outside Databricks
still needs a governance layer that spans both worlds, which is exactly the kind of gap
Paul's compliance background is positioned to speak to.

### Model Serving
**What it is:** Foundation Model APIs continue to host an increasingly broad set of
frontier models (Databricks' release notes show new Anthropic, OpenAI, Google, and Alibaba
models added roughly monthly through 2026 — exact model names churn too fast to memorize,
the point is breadth-of-choice, not any specific model). The bigger structural addition:
**Custom Model Serving (Beta, ~May 2026)** lets you serve your own fine-tuned/custom LLMs
on a vLLM engine, including multimodal models and PEFT recipes Foundation Model APIs
doesn't support natively, plus horizontal scaling and zero-downtime deployment. Also new:
Unity Catalog permissions on Foundation Models (GA June 2026) and OpenTelemetry-based
endpoint telemetry persisted to UC tables. **Source:** [Databricks-hosted foundation models](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models), [release notes June 2026](https://docs.databricks.com/aws/en/release-notes/product/2026/june).
**What problem it solves:** Previously, serving a genuinely custom (not just fine-tuned via
their pipeline) model on Databricks meant fighting the platform. vLLM-backed custom serving
closes that gap.
**How it connects to RAG/agentic work:** This is the generation endpoint in a
Databricks-native RAG/agent stack — same governed-endpoint idea as calling Bedrock or
Azure OpenAI, but with UC permissions and lineage wired straight through.
**Key tradeoff vs. calling model provider APIs directly or self-hosting on your own vLLM
cluster:** Model Serving gives you one governed endpoint abstraction across every provider
plus your own custom models — at Databricks' markup and inside its compute pricing.
Self-hosting your own vLLM cluster (or calling providers directly) is cheaper at scale and
avoids platform lock-in, but you lose the single-pane governance and UC-native audit trail.

### Lakebase (Postgres-compatible OLTP)
**What it is:** A serverless, fully managed Postgres (17, with pgvector) database, GA on
AWS since Feb 2026 and Azure since March 2026. Compute and storage scale independently,
supports instant branching/zero-copy clones, point-in-time recovery, and native Unity
Catalog governance. **Source:** [Lakebase GA announcement](https://community.databricks.com/t5/announcements/databricks-lakebase-is-now-generally-available/td-p/147678), [Azure GA blog](https://www.databricks.com/blog/azure-databricks-lakebase-generally-available), [Lakebase docs](https://docs.databricks.com/aws/en/oltp/).
**What problem it solves:** Databricks was analytical/OLAP-only — no good story for
transactional (OLTP) workloads living next to lakehouse data. Lakebase closes that gap so
an application's operational database and its analytical/AI data can live under one
governance model instead of a separate RDS/Cloud SQL instance bolted on the side.
**How it connects to RAG/agentic work:** Per the Agent Bricks DAIS 2026 announcement,
Lakebase is explicitly the backing store for Databricks' new **agent memory service** — so
this is the direct Databricks answer to "where does an agent's conversation/session state
live," a question Paul already has opinions on from building agentic systems elsewhere.
With pgvector included, it can also double as a lightweight vector store for smaller-scale
RAG use cases.
**Key tradeoff vs. Aurora/Cloud SQL/self-hosted Postgres:** Lakebase collapses OLTP,
analytics, and AI serving into one governed, branchable Postgres — but you give up the
multi-cloud portability and years of ecosystem maturity (extensions, tooling, third-party
integrations) that RDS/Cloud SQL/Aurora have. It's a strong pitch if the whole stack is
already Databricks-native; less compelling if the transactional app needs to live
independently of the lakehouse.

---

## Tier 2 — good to know

### Lakeflow (the Delta Live Tables rename/unification)
**What it is:** DLT was renamed **Lakeflow Declarative Pipelines** (GA on AWS/Azure/GCP
since June 12, 2025) as part of unifying ingestion (**Lakeflow Connect**), transformation
(**Lakeflow Declarative Pipelines**), and orchestration (**Lakeflow Jobs**, the renamed
Workflows) under one Lakeflow brand. Existing DLT code, the `dlt` Python module, and SQL
syntax all still work — no forced migration. **Source:** [What happened to DLT?](https://docs.databricks.com/aws/en/ldp/concepts/where-is-dlt).
**What problem it solves:** "Delta Live Tables" was a confusing name (people assumed it was
just a Delta table variant) — the rename clarifies this is a full declarative pipeline
product family, not a storage format feature.
**How it connects to RAG/agentic work:** This is the ingestion layer under any
Databricks-native RAG pipeline — raw docs land via Lakeflow Connect, get parsed/chunked in
Lakeflow Declarative Pipelines, then feed AI Search indexing.
**Key tradeoff vs. Airflow/dbt:** Lakeflow is declarative and natively lineage/governance
integrated with Unity Catalog, but it's a Databricks-only paradigm; Airflow remains the
more portable, ecosystem-agnostic orchestrator, and dbt remains the SQL-transformation-only
tool of choice if a team doesn't want full platform lock-in.

### Genie One / Databricks One rename (AI-BI natural-language querying)
**What it is:** "Databricks One," the simplified consumer-facing interface, evolved into
**Genie One** — the flagship of a broader "Genie" family that also includes **Genie
Agents** (renamed from Genie Spaces) and **Genie Code**. Genie One is a GA
natural-language-to-data "agentic coworker" for business users (marketing, finance, sales,
ops), and a mobile app shipped in 2026. **Source:** [Genie One press release](https://www.databricks.com/company/newsroom/press-releases/databricks-launches-genie-one-all-new-agentic-coworker-every-team), [community writeup](https://community.databricks.com/t5/mvp-articles/databricks-one-is-now-genie/td-p/155665).
**What problem it solves:** Non-technical stakeholders asking data questions in plain
English against governed lakehouse data, without writing SQL or waiting on an analyst.
**How it connects to RAG/agentic work:** Architecturally this is a NL-to-SQL/BI agent
grounded in UC metadata (semantic models, metric views) rather than a document RAG system —
worth knowing the distinction if asked to compare it to a RAG chatbot.
**Key tradeoff vs. a custom NL-to-SQL agent or Looker/Tableau + a chat layer:** Genie is
deeply pre-integrated with UC governance and lakehouse semantics out of the box, but it's
Databricks-only; a custom-built NL-to-SQL agent (or pairing an existing BI tool with a
lightweight LLM layer) is more flexible and portable but requires building the semantic
grounding yourself.

### DBRX retirement — Databricks is no longer trying to be a model vendor
**What it is:** DBRX (Databricks' in-house open model) was retired from Foundation Model
APIs pay-per-token and from Foundation Model Fine-tuning in April 2025, and has not been
replaced by a Databricks-branded successor. **Source:** [Release notes, April 2025](https://docs.databricks.com/aws/en/release-notes/product/2025/april), [supported models doc](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models).
**What problem it solves (strategically):** Rather than compete as a foundation-model
vendor against OpenAI/Anthropic/Google, Databricks doubled down on being the neutral
platform layer — governance, serving, evaluation — that sits on top of *whichever* frontier
model a customer picks (including, per the DAIS 2026 announcement, a new SpaceX
partnership bringing Grok models onto the platform).
**How it connects to RAG/agentic work:** Useful framing if asked "does Databricks compete
with OpenAI/Anthropic" — the honest current answer is no, they've positioned themselves as
model-agnostic infrastructure, which is a meaningfully different posture than the DBRX-era
strategy.
**Key tradeoff vs. building/using a proprietary model:** No lock-in to one model's
capability ceiling, and customers get to pick best-in-class per task — but Databricks has
no cost/margin advantage from owning the model layer, and customers still pay
provider-level token pricing on top of Databricks' platform fee.

### AI Functions (`ai_query`, `ai_extract`, `ai_classify`) — SQL-native LLM calls
**What it is:** SQL/Python functions that call any supported AI model directly from a query
— `ai_query` (general purpose), `ai_extract` (structured extraction from text/documents to
a schema), `ai_classify` (custom-label classification) — all reached GA in June 2026.
**Source:** [Release notes, June 2026](https://docs.databricks.com/aws/en/release-notes/product/2026/june).
**What problem it solves:** Lets an analyst call an LLM as a SQL function inline in a query
or pipeline, without writing a Python service around it.
**How it connects to RAG/agentic work:** Handy for lightweight extraction/classification
steps inside an ingestion pipeline (e.g., document type classification before chunking)
without standing up a separate service call.
**Key tradeoff vs. calling the model from application code:** Trivially easy for
warehouse-native teams and inherits UC governance automatically, but it's a blunter
instrument than a real agent pipeline — no multi-step reasoning, tool use, or memory; it's
single-call LLM-as-SQL-function, not agentic.

---

## Unconfirmed / flag for Paul to double-check himself

- **Specific current frontier model names/versions hosted on Model Serving** (e.g. exact
  Claude/GPT/Gemini/Qwen version numbers cited in Databricks' own 2026 release notes) — I
  verified these came from official `docs.databricks.com` release-notes pages, but the
  lineup changes roughly monthly, so treat any specific version number as likely stale by
  interview day. The durable fact is "broad, frequently-updated multi-provider support,"
  not any one model name.
- **CLEARS framework's exact tie to EU AI Act post-market monitoring** — a secondary source
  (not an official Databricks page) made this compliance connection; I could not confirm it
  directly on a databricks.com/docs page, so don't state it as an official Databricks claim
  in the interview — it's a reasonable inference, not a documented one.
- **"Genie Ontology," "Omnigent," and "Databricks Sandbox"** (mentioned in the Agent Bricks
  DAIS 2026 blog as sub-components) — confirmed they were named in the official blog post,
  but I did not find separate deep documentation on each; treat them as "named at
  announcement" rather than "well-documented, stable features" if pressed for detail.
