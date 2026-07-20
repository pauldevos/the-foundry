# Learning Decks

Generated card sets for the AI Director / FDE skills map. Each `.json` is the
structured source; this file is a readable render of the same content.
**Total: 50 cards across 5 topics so far.**


## Agentic AI / Multi-Agent Systems
*Tier 1 · ~90% of postings · 10 cards · [agentic-multi-agent.json](agentic-multi-agent.json)*

**Sources:**
- [LangGraph / LangChain docs](https://docs.langchain.com)
- [Stanford CS224G Lecture 7 — Agent Orchestration & Workflow Design](https://web.stanford.edu/class/cs224g)
- [Harrison Chase — 3 ingredients for building reliable enterprise agents](https://www.youtube.com/watch?v=kTnfJszFxCg)

**[Recall]** What is the ReAct pattern in agent design?
> Reason + Act: the model alternates between generating a reasoning trace and taking an action (tool call), observing the result, then reasoning again — interleaving thought and action instead of planning everything upfront.

**[Recall]** How does a "planning" agent differ from ReAct?
> Planning agents decompose a goal into a sequence of subgoals upfront before executing any of them, then execute the plan (possibly replanning on failure) — more structured and predictable than ReAct's step-by-step improvisation, but less adaptive to surprises mid-execution.

**[Recall]** What does a "reflection" agent add on top of basic execution?
> A self-critique step: after producing output, the agent evaluates its own work against the goal/criteria and iterates before finalizing — trading extra latency/cost for higher output quality.

**[Why]** Why did LangGraph get built as a separate framework instead of just extending LangChain's chains?
> LangChain's chains are linear/DAG pipelines; robust agents need explicit state, branching, loops, retries, and human-in-the-loop interrupts. LangGraph models the agent as an explicit state graph — nodes are steps, edges are transitions — so you can pause, resume, and control flow precisely instead of hoping a chain figures it out.

**[Recall]** What's the difference between a stateful and stateless agent?
> Stateless: each call is independent, no memory across turns/sessions — simple, but can't do multi-step or long-running work. Stateful: maintains context across the interaction, required for anything beyond single-shot Q&A.

**[Recall]** What's the difference between the Supervisor and Peer orchestration patterns?
> Supervisor: one central coordinator delegates tasks to specialist sub-agents and synthesizes their outputs — clear accountability, single point of control. Peer: agents communicate directly as equals with no central coordinator — more flexible, harder to debug and keep aligned.

**[Why]** Why do LangGraph, CrewAI, and AutoGen/MAF differ in philosophy, and how do you choose?
> LangGraph: low-level, explicit state graphs — maximum control, production-grade, steeper learning curve. CrewAI: role-based abstraction (assign agents "roles" like a team) — faster to prototype, less fine-grained control. AutoGen/MAF: Microsoft's conversation-centric framework, strong in enterprise/Azure ecosystems. Pick based on control needed vs. speed to prototype.

**[Application]** When would you choose a hierarchical multi-agent pattern over a flat supervisor pattern?
> When the task naturally decomposes into layers of abstraction — a manager agent delegates to team-lead agents, who each delegate to specialist agents. Hierarchical scales better for complex, multi-domain tasks than one supervisor coordinating everything directly.

**[Recall]** What is "tool use" / "function calling" in the context of agents?
> The model is given structured definitions of available tools (name, description, parameters) and can emit a structured call to one instead of, or alongside, natural language — the runtime executes the real function and feeds the result back into context.

**[Why]** Why is state management the hardest part of production agent systems, not the model itself?
> Real agent work spans multiple calls, tool executions, and potentially human interrupts over minutes to hours — you need durable state that survives restarts, clear rollback/retry semantics on failure, and a way to resume exactly where you left off. That's systems engineering, not prompting.

---

## LLM Evaluation Frameworks
*Tier 1 · ~88% of postings · 10 cards · [llm-evaluation-frameworks.json](llm-evaluation-frameworks.json)*

> This complements the Hamel/Shreya video already in the corpus, which covers the error-analysis PROCESS (open/axial coding, benevolent dictator). This deck covers the specific FRAMEWORKS and METRICS — the vocabulary an interviewer expects you to name.

**Sources:**
- [RAGAS docs](https://docs.ragas.io)
- [TruLens](https://trulens.org)
- [DeepEval docs](https://deepeval.com/docs)
- [Promptfoo docs](https://promptfoo.dev)
- [Hamel Husain & Shreya Shankar — Why AI evals are the hottest new skill](https://www.youtube.com/watch?v=BsWxPI9UM4c)

**[Recall]** What does RAGAS's "faithfulness" metric measure?
> Whether every claim in the generated answer is actually supported by the retrieved context — computed by decomposing the answer into individual claims, then checking each against the context for entailment. Catches hallucination even when the answer sounds fluent.

**[Recall]** What does RAGAS's "answer relevancy" measure?
> Whether the answer actually addresses the question asked — computed by generating several synthetic questions the answer would answer, then measuring embedding similarity to the original question. Low relevancy means the answer is accurate but off-topic or evasive.

**[Why]** Why is "context precision" alone not enough to judge a RAG system?
> You can have perfectly relevant retrieved chunks (high precision) but still miss chunks that were needed (low recall) — an answer built on relevant-but-incomplete context. You need both dimensions, broken down by failure type, not one composite score.

**[Recall]** What's the core architectural difference between DeepEval and Promptfoo?
> DeepEval is Python/pytest-native — evals run as unit tests and fail your CI build on a metric threshold breach. Promptfoo is a config-driven (YAML), language-agnostic CLI built for side-by-side prompt/model comparison and has a much stronger red-teaming/security-scanning engine (40+ attack types).

**[Why]** Why do mature eval stacks run both DeepEval and Promptfoo instead of picking one?
> They answer different questions: Promptfoo answers "can an attacker break this" (jailbreaks, injection, excessive agency); DeepEval answers "does this meet our quality bar" (faithfulness, hallucination, relevancy). Different failure modes, different tools, both run as CI gates before deploy.

**[Application]** In an LLM-as-judge setup, why should the judge always output binary pass/fail rather than a 1-5 score?
> 1-5 scores collapse into noise — humans and models disagree on what a "3" means, and the score doesn't map to an action. Binary forces a decision and can be directly validated against human labels with a confusion matrix.

**[Why]** Why must you validate an LLM judge against human labels before trusting it in production?
> A judge can silently be biased — e.g., always saying "pass" — and still show high raw agreement if real failures are rare. A confusion matrix breaks that down cell by cell so you see exactly where the judge is wrong, not just an aggregate percentage.

**[Recall]** What's the difference between a "unit eval" and a "regression eval"?
> Unit eval tests a single LLM call/component in isolation before deploy, like a unit test. Regression eval runs continuously against production traffic or a fixed dataset to catch silent drift — a model or prompt change degrading quality without an obvious error.

**[Recall]** What is G-Eval (used in DeepEval)?
> A metric that uses an LLM with chain-of-thought reasoning to score outputs against a custom rubric you define in natural language — more flexible than fixed metrics like BLEU/ROUGE, but still needs validation against human judgment like any LLM-judge.

**[Why]** Why is evals now a core product-building skill instead of a QA afterthought?
> You can't productively iterate on a model or prompt without a way to measure whether a change helped — evals are the feedback loop, not a compliance checkbox. Teams that skip them end up debugging by vibes.

---

## MCP, A2A & Agent Governance
*Tier 2 · MCP ~65%, Governance ~78% · 10 cards · [mcp-a2a-governance.json](mcp-a2a-governance.json)*

**Sources:**
- [Model Context Protocol spec](https://modelcontextprotocol.io)
- [A2A Protocol spec](https://a2a-protocol.org)
- [Mahesh Murag — Building Agents with MCP (full workshop)](https://www.youtube.com/watch?v=kQmXtrmQ5Zg)
- [Where AI governance is headed — Databricks / ThoughtWorks](https://www.youtube.com/watch?v=UrhnwOPJG4w)

**[Recall]** What are the three core interfaces MCP defines?
> Tools (model-controlled actions the agent can invoke), Resources (application-controlled data the client exposes), and Prompts (user-controlled templates) — each serves a distinct role in the client-server interaction.

**[Why]** Why does MCP separate "tools" from "resources" instead of treating everything as one kind of capability?
> Tools are actions with side effects that the model decides to invoke; resources are read-only data the application decides to expose. Different control planes need different permission models — you don't want a model deciding what data to expose, or an app deciding what actions to take.

**[Why]** What problem does MCP solve architecturally?
> Before MCP, every AI app needed a custom integration for every tool/data source — N apps x M tools = N x M integrations. MCP standardizes the interface so one MCP server works with any MCP-compatible client, collapsing N x M into N + M.

**[Recall]** What is "sampling" in MCP?
> An MCP server can request an LLM completion FROM the client rather than needing its own model access — servers stay lightweight (no API key, no model management) while the client controls cost, privacy, and model choice.

**[Why]** How does MCP differ from A2A, and why do you need both?
> MCP connects an agent to its tools/data (agent-to-tool). A2A connects independent agents to each other so they can discover, delegate to, and collaborate with agents built on different frameworks (agent-to-agent). Use MCP to equip one agent; use A2A to let that agent work with other agents outside your system.

**[Recall]** What does "composability" mean in MCP's architecture?
> Any application can be both an MCP client and an MCP server simultaneously — enabling layered/hierarchical architectures where one agent's output becomes another agent's tool, without a different protocol at each layer.

**[Application]** Why does fixed role-based permissions (RBAC) fail for AI agents in enterprise governance?
> An agent's permissions need to be scoped to the specific task/context at runtime, not a fixed role like "support-agent-can-read-all-customers." Fixed roles are too broad for agents operating across many different contexts moment to moment — capabilities need to be short-lived and use-case specific.

**[Recall]** What is "tainting" as an agent sandboxing technique?
> If an agent reads from a sensitive data source, it gets flagged/tainted and is then prevented from writing to any non-sensitive downstream location — stops sensitive data from silently leaking through an agent's output path.

**[Recall]** What are the five foundational primitives for enterprise agent governance?
> Identity (agents need their own, separate from human users), Capabilities (short-lived, scoped permissions), Sandboxing (containment, tainting), Observability (execution tracing), Resource accounting (real-time token/cost control, not month-end reconciliation).

**[Why]** Why must token/resource costs for agents be controlled in real time rather than reconciled after the fact?
> Agents can loop, retry, and compound costs unpredictably in ways a human-driven system never would — a runaway loop can burn thousands of dollars before a monthly bill would surface the problem. Cost needs to be a live control surface (circuit breakers, budgets), not an accounting exercise.

---

## Prompt Engineering
*Tier 1 · ~85% of postings · 10 cards · [prompt-engineering.json](prompt-engineering.json)*

**Sources:**
- [Claude Platform Docs](https://platform.claude.com/docs)
- [OpenAI Platform Docs](https://platform.openai.com/docs)
- [Prompt Caching: Cut Your AI Cost by 90% (already in corpus)](https://www.youtube.com/watch?v=HDMqDV7mmGo)
- [Kevin Weil — OpenAI CPO on model maximalism (already in corpus)](https://www.youtube.com/watch?v=scsW6_2SPC4)

**[Recall]** What is chain-of-thought (CoT) prompting?
> Instructing the model to reason step-by-step before giving a final answer rather than jumping straight to it — generating intermediate reasoning tokens measurably improves accuracy on multi-step problems, especially math and logic.

**[Why]** Why do system prompts matter more than user-turn instructions for consistent behavior?
> The system prompt sets persistent context, persona, and constraints that apply across the entire conversation, while user turns are one-off requests. Putting stable rules (tone, format, boundaries) in the system prompt keeps behavior consistent even as users phrase requests differently turn to turn.

**[Recall]** What is few-shot prompting, and when does it help most?
> Providing 2-5 example input/output pairs in the prompt before the real request — most useful when the desired output format or style is unusual or hard to describe in words alone; the examples do the specifying that instructions can't.

**[Why]** What is structured output (e.g. forced JSON) and why does it matter for production systems?
> Constraining the model's output to a specific schema rather than free text. Critical for production because downstream code needs to parse the response reliably — free text requires fragile regex/parsing that breaks on format drift.

**[Why]** Why is "tool calling" considered a prompt-engineering skill, not just an API feature?
> How you name and describe a tool — its parameters, when to use it vs. not — directly determines whether the model calls it correctly and at the right moment. A poorly described tool gets misused or ignored regardless of how good the underlying function is; the tool description IS a prompt.

**[Application]** When should you use XML-style tags to structure a prompt versus plain prose?
> When a prompt has multiple distinct sections the model needs to treat differently (e.g. <context>, <instructions>, <examples>) — tags give the model unambiguous boundaries, reducing the chance it conflates instructions with reference material, especially in long prompts.

**[Recall]** What is prompt caching, and what's the practical benefit?
> Marking a portion of the prompt — a long system prompt or document — as reusable across calls so the model doesn't reprocess it from scratch each time. Cuts both cost and latency significantly for repeated or similar requests.

**[Why]** Why does "put it in context" usually beat "hope the model remembers it" for anything important?
> The context window is the model's working memory — directly accessible and precise. Parametric/trained-in knowledge is more like vague recollection, prone to blending facts or hallucinating specifics. If a fact matters, include it explicitly rather than trusting recall.

**[Recall]** What's the difference between zero-shot, few-shot, and fine-tuned approaches to getting a specific model behavior?
> Zero-shot: instructions only, fastest to try, least reliable for unusual formats. Few-shot: instructions plus examples, better format-fidelity, costs context tokens every call. Fine-tuned: the behavior is baked into the weights — most reliable and cheapest per-call at scale, but requires training data and infrastructure.

**[Why]** Why does "model maximalism" change how you should prompt-engineer today?
> Building elaborate prompt scaffolding to work around a model's current weaknesses is a bet that pays off short-term but gets obsoleted as the model improves every 2-3 months — the scaffolding becomes dead weight. Design for where the model is heading, not just where it is today.

---

## RAG Architecture
*Tier 1 · ~95% of postings · 10 cards · [rag-architecture.json](rag-architecture.json)*

**Sources:**
- [LlamaIndex framework docs](https://developers.llamaindex.ai/python/framework/)
- [Jerry Liu — Building Production-Ready RAG Applications](https://www.youtube.com/watch?v=TRjq7t2Ms5I)

**[Why]** Why does chunk size matter so much in RAG, and how do you pick it?
> Too small loses context and answers feel fragmented; too large dilutes the embedding's signal and retrieval gets noisy. It's dataset-specific and empirically tuned — start around 512-1024 tokens with 10-20% overlap, then measure retrieval precision/recall as you adjust.

**[Recall]** What's the difference between fixed-size and semantic chunking?
> Fixed-size splits by token count regardless of content boundaries. Semantic chunking splits at natural breakpoints (paragraph, topic shift) detected via embedding similarity between adjacent sentences — better coherence, more expensive to compute.

**[Why]** Why combine BM25 (sparse) with dense embedding retrieval instead of using just one?
> BM25 catches exact keyword/entity matches (SKUs, names, acronyms) that embeddings can blur together. Dense embeddings catch semantic/paraphrase matches BM25 misses entirely. Hybrid covers both failure modes.

**[Recall]** What is Reciprocal Rank Fusion (RRF)?
> A method for merging ranked result lists from multiple retrievers by scoring each document as the sum of 1/(k + rank) across all lists — a document ranked high in either list rises to the top of the merged list, without needing to normalize disparate score scales.

**[Why]** Why add a reranking step after initial retrieval instead of just retrieving more precisely upfront?
> Initial retrieval (BM25/dense) has to be fast across millions of docs, trading precision for speed. A reranker (often a cross-encoder) re-scores only the top-k candidates with a far more expensive, accurate model — you get retrieval's speed and reranking's precision.

**[Recall]** What's the difference between a bi-encoder and a cross-encoder for retrieval?
> Bi-encoder embeds query and document separately, then compares vectors — fast, used for initial retrieval at scale. Cross-encoder feeds query+document together into one model for a joint relevance score — slow but far more accurate, used only on the small reranking shortlist.

**[Why]** Why do low precision and low recall in retrieval require different fixes?
> Low precision (irrelevant chunks retrieved) drives hallucination risk — fix with better reranking/filtering. Low recall (missing necessary info) causes incomplete answers — fix with chunking strategy, higher k, or query expansion.

**[Recall]** What is "small-to-big" retrieval?
> Embed and search over small units (sentences) for retrieval precision, but expand to a larger surrounding window (parent paragraph/section) at synthesis time — precise matching, full context for the answer.

**[Application]** When would you fine-tune an embedding model instead of just swapping to a better off-the-shelf one?
> When your domain vocabulary is highly specialized (legal, medical, internal jargon) and general embeddings cluster your domain's distinct concepts together — fine-tuning on synthetic query-document pairs from your own corpus teaches the model your domain's actual semantic distinctions.

**[Recall]** What does "context precision" measure in a RAG eval, and how does it differ from "context recall"?
> Precision: of the chunks you retrieved, what fraction were actually relevant (signal-to-noise). Recall: of the chunks needed to answer, what fraction did you actually retrieve (completeness). A system can have perfect precision and terrible recall.

---
