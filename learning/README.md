# Learning Decks

Generated card sets for the AI Director / FDE skills map. Each `.json` is the
structured source; this file is a readable render of the same content.

See also: [glossary.md](glossary.md) (85 terms so far) and lecture notes:

**Total: 202 cards (102 starred) across 16 decks. Plus 3 lecture-notes files.**

- [lecture-notes-cme295-l1.md](lecture-notes-cme295-l1.md)
- [lecture-notes-cme295-l7.md](lecture-notes-cme295-l7.md)
- [lecture-notes-cme295-l8.md](lecture-notes-cme295-l8.md)

## Agentic AI / Multi-Agent Systems
*Tier 1 · ~90% of postings · 10 cards (4 starred) · [agentic-multi-agent.json](agentic-multi-agent.json)*

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

**[Why]** ⭐ Why did LangGraph get built as a separate framework instead of just extending LangChain's chains?
> LangChain's chains are linear/DAG pipelines; robust agents need explicit state, branching, loops, retries, and human-in-the-loop interrupts. LangGraph models the agent as an explicit state graph — nodes are steps, edges are transitions — so you can pause, resume, and control flow precisely instead of hoping a chain figures it out.

**[Recall]** What's the difference between a stateful and stateless agent?
> Stateless: each call is independent, no memory across turns/sessions — simple, but can't do multi-step or long-running work. Stateful: maintains context across the interaction, required for anything beyond single-shot Q&A.

**[Recall]** What's the difference between the Supervisor and Peer orchestration patterns?
> Supervisor: one central coordinator delegates tasks to specialist sub-agents and synthesizes their outputs — clear accountability, single point of control. Peer: agents communicate directly as equals with no central coordinator — more flexible, harder to debug and keep aligned.

**[Why]** ⭐ Why do LangGraph, CrewAI, and AutoGen/MAF differ in philosophy, and how do you choose?
> LangGraph: low-level, explicit state graphs — maximum control, production-grade, steeper learning curve. CrewAI: role-based abstraction (assign agents "roles" like a team) — faster to prototype, less fine-grained control. AutoGen/MAF: Microsoft's conversation-centric framework, strong in enterprise/Azure ecosystems. Pick based on control needed vs. speed to prototype.

**[Application]** ⭐ When would you choose a hierarchical multi-agent pattern over a flat supervisor pattern?
> When the task naturally decomposes into layers of abstraction — a manager agent delegates to team-lead agents, who each delegate to specialist agents. Hierarchical scales better for complex, multi-domain tasks than one supervisor coordinating everything directly.

**[Recall]** What is "tool use" / "function calling" in the context of agents?
> The model is given structured definitions of available tools (name, description, parameters) and can emit a structured call to one instead of, or alongside, natural language — the runtime executes the real function and feeds the result back into context.

**[Why]** ⭐ Why is state management the hardest part of production agent systems, not the model itself?
> Real agent work spans multiple calls, tool executions, and potentially human interrupts over minutes to hours — you need durable state that survives restarts, clear rollback/retry semantics on failure, and a way to resume exactly where you left off. That's systems engineering, not prompting.

---

## AI Roadmap & Strategy
*Tier 2 · ~70% of postings · 8 cards (5 starred) · [ai-roadmap-strategy.json](ai-roadmap-strategy.json)*

> Genuinely the thinnest-sourced topic in this set — it's more judgment than fact, and the map itself flags it as weaker. Treat these as starting frames to argue from in an interview, not settled answers.

**Sources:**
- [Kevin Weil — OpenAI CPO on AI product strategy (already in corpus)](https://www.youtube.com/watch?v=scsW6_2SPC4)
- [Sherwin Wu — OpenAI platform engineering, on why AI deployments fail (already in corpus)](https://www.youtube.com/watch?v=B26CwKm5C1k)

**[Why]** ⭐ Why do negative-ROI AI deployments usually trace back to a top-down mandate rather than a bad model choice?
> Per Sherwin Wu: mandated rollouts without bottoms-up adoption skip the step where real users find real use cases. Successful implementations need internal tiger teams of enthusiasts who evangelize concrete workflows — the technology succeeding is rarely the bottleneck; adoption and use-case fit is.

**[Recall]** What is an AI opportunity assessment / feasibility analysis, as a roadmap step?
> Before committing engineering time, systematically evaluate candidate use cases against: is the data available and clean, is the cost of being wrong tolerable for this task, does a model actually solve this better than existing tooling, and what's the realistic ROI timeline — filters enthusiasm down to what's actually worth building.

**[Why]** ⭐ Why does "build for where models are heading, not where they are today" matter for roadmap decisions specifically?
> A roadmap built around today's model limitations (elaborate workarounds, heavy scaffolding) becomes technical debt within months as models improve — the constraint you designed around disappears, but the complexity you added to handle it doesn't. Roadmap bets should target capability that's imminent, not just current.

**[Application]** ⭐ How do you frame ROI for an AI initiative to a skeptical executive who's seen AI hype before?
> Anchor to a specific, measurable business metric the initiative moves (cycle time, cost per ticket, conversion rate) rather than "AI capability" in the abstract — and pair it with the cost of the status quo (what does NOT doing this cost, in the same units), since "AI is exciting" doesn't survive a budget conversation but "this saves $X/quarter" does.

**[Recall]** What's the difference between a build, buy, and partner decision for an AI capability?
> Build: you have genuine differentiation in this specific capability and the engineering capacity to own it long-term. Buy: the capability is commoditized (a vector DB, an eval framework) — paying for a mature tool beats reinventing it. Partner: the capability requires domain expertise or infrastructure you don't have and won't build (e.g. a specialized data provider) — a vendor relationship is faster and often better than either building or buying a generic tool.

**[Why]** ⭐ Why is "we should use AI for X" usually the wrong starting frame for a roadmap conversation?
> It starts from the technology and searches for a problem, which is backwards — the stronger frame starts from a real, costly business problem and asks whether AI is actually the best available solution (sometimes it isn't). Roadmaps built technology-first tend to ship demos; roadmaps built problem-first tend to ship things people actually use.

**[Recall]** What does "vendor selection" actually involve for an enterprise AI roadmap, beyond picking a model provider?
> Model provider is one decision among several: orchestration framework, vector store, observability/eval tooling, and increasingly a managed-agents platform — each with its own build-vs-buy tradeoff, lock-in risk, and compliance posture (data retention, residency) that needs evaluating independently, not bundled into one "AI vendor" decision.

**[Why]** ⭐ Why should an AI roadmap explicitly budget for evals and observability infrastructure, not just model/feature development?
> Without measurement infrastructure, you can't tell if a shipped feature is actually working, can't catch regressions from model updates, and can't make the ROI case for the next initiative — eval/observability work is often treated as overhead and cut first, which is exactly backwards, since it's what makes every other roadmap bet legible.

---

## Claude & OpenAI APIs
*Tool deep-dive · underlies Prompt Engineering + Production Deployment (Tier 1) · 10 cards (4 starred) · [claude-openai-apis.json](claude-openai-apis.json)*

> Model names and specific API surface change fastest of anything in this repo — verify against current docs before an interview, don't rely on cards alone here.

**Sources:**
- [Claude Platform Docs](https://platform.claude.com/docs)
- [OpenAI Platform Docs](https://platform.openai.com/docs)
- [Stop Building Agent Loops — managed agents comparison (already in corpus)](https://www.youtube.com/watch?v=PnEusTChQcE)

**[Recall]** What's the core capability tier structure across both Claude and OpenAI model families?
> Frontier (Opus-class / GPT-class flagship): best reasoning, highest cost, for complex synthesis and agentic work. Mid-tier (Sonnet-class / GPT-mini-class): the workhorse — best cost/quality balance for most production traffic. Small/fast (Haiku-class / nano-class): classification, routing, high-volume simple tasks.

**[Recall]** What is the Message Batches API (Anthropic), and what's the tradeoff?
> Submit large volumes of requests for asynchronous processing at a 50% cost reduction versus real-time calls. Tradeoff: results aren't immediate — right for offline/bulk work (batch-scoring a document archive), wrong for anything a user is waiting on.

**[Why]** ⭐ Why does a Token Counting API matter as a distinct tool from just calling the model?
> Lets you estimate cost and check context-window fit before actually sending a request — critical for production systems that need to budget calls, chunk long inputs correctly, or reject oversized requests gracefully instead of discovering the problem via a failed API call.

**[Recall]** What are the three components Anthropic's managed agents architecture separates work into?
> Brain (the stateless model itself), Hands (the ephemeral sandbox/tool-execution environment), and Session (a durable, append-only log) — this separation is what enables resilient recovery for long-running agent workloads that might span minutes to hours.

**[Why]** ⭐ Why do managed agent platforms charge per active session hour on top of token costs?
> A long-running agent session holds infrastructure (sandbox, state, connections) even during periods where it isn't actively generating tokens — the session-hour charge reflects that standing infrastructure cost, separate from the compute cost of actual model calls.

**[Recall]** What is structured output / tool-use forcing, and why does it matter more for agents than for simple chat?
> Constraining the model to respond in a defined schema (or forcing a specific tool call) rather than free text. For agents specifically, this is what makes multi-step orchestration reliable — the orchestrating code needs to parse the model's decision deterministically to route to the next step, not regex-parse prose.

**[Why]** ⭐ Why does streaming matter architecturally for agent UIs, beyond just "feels faster"?
> For long agent tasks, streaming lets you surface intermediate progress (tool calls happening, partial reasoning) rather than a user staring at a blank screen for 30+ seconds — it's a reliability/trust signal as much as a perceived-speed one, especially as tasks get more multi-step and take longer.

**[Recall]** What is prompt caching's mechanism, concretely, in the Claude/OpenAI APIs?
> You mark a stable prefix of your prompt (system prompt, long reference document) as cacheable; on subsequent calls with the same prefix, the provider skips reprocessing it from scratch and charges a much lower rate for the cached portion — the saving compounds heavily in agent loops that resend the same large context repeatedly.

**[Application]** ⭐ You're deciding between building your own agent loop versus using a managed agents API. What's the actual decision driver?
> If your differentiation is in HOW the agent works — custom tools, specific credentials, a particular iteration strategy — build your own loop for full control. If your differentiation is in WHAT the agent produces and you want the fastest path to shipping, a managed platform's built-in sandboxing, state persistence, and failure recovery save weeks of infrastructure work you'd otherwise have to build and hardened yourself.

**[Recall]** What's a practical reason a managed agent platform might be disqualified for a given enterprise use case?
> Compliance requirements like zero data retention or HIPAA BAA — managed agent platforms are stateful by design (they persist session state, memory, logs), which can conflict directly with those requirements. Worth checking before committing architecture to a managed platform in a regulated industry.

---

## CME 295 L7 — Tool Calling & ReAct Mechanics
*Tier 1 · ~90% of postings · 13 cards (7 starred) · [cme295-l7-tools-agents-cards.json](cme295-l7-tools-agents-cards.json)*

> Companion to agentic-multi-agent.json. That deck covers orchestration patterns/frameworks generally; this one covers the concrete tool-calling mechanics and a fully worked ReAct loop from the lecture.

**Sources:**
- [CME 295 Lecture 7 — Amidi brothers, Stanford](https://www.youtube.com/watch?v=h-7S6HNq0Vg)

**[Why]** ⭐ Why doesn't a very long context window alone solve the "put everything in the prompt" problem?
> Needle-in-a-haystack testing shows models reliably struggle to retrieve facts placed in roughly the first half of a long prompt, regardless of whether the fact technically fits in context — length alone doesn't guarantee the model can find and use what's there.

**[Recall]** What does RAG stand for, stage by stage?
> Retrieve relevant documents, Augment the prompt with them, Generate the response from the augmented prompt.

**[Recall]** What are the two stages of RAG retrieval, and what does each optimize for?
> Candidate retrieval: cheap, optimized for recall (cast a wide net). Ranking/reranking: more compute-intensive, optimized for precision on the smaller candidate set that survived the first stage.

**[Recall]** ⭐ What does the LLM actually see when a tool/function is available to it?
> Only the function's signature, documented inputs/outputs, and a natural-language description — never the implementation. It decides which function to call and what arguments to supply, not how the function works internally.

**[Why]** ⭐ Why are tool/function APIs pre-defined by the developer rather than generated by the LLM on the fly?
> The model's role is narrowly to select the right tool and populate its arguments correctly from the user's request — the tool's actual implementation runs as ordinary code outside the model entirely, which is what makes tool execution reliable and auditable.

**[Recall]** Walk through the five steps of a tool call end to end.
> (1) Function API + docs inserted into the prompt preamble. (2) LLM reads the query and emits a call with arguments. (3) The function executes completely outside the LLM. (4) The structured result is fed back into the model's context. (5) The LLM generates a final natural-language response grounded in that result.

**[Recall]** What does ReAct stand for, and what's the core loop?
> Reason + Act. A complex goal is decomposed into a repeating loop of atomic sub-steps — commonly framed as observe → plan → act (or think → observe → act in the original paper) — rather than solved in one shot.

**[Application]** ⭐ In the ReAct "cold room" example, what happens in each stage of the loop?
> Observe: link "teddy bear is cold" to unknown room temperature. Plan: decide to check the temperature. Act: call get_current_room_temperature. Observe (loop): 65°F, colder than expected. Plan: raise the temperature. Act: call set_temperature. Observe (loop): temperature now correct — exit and respond.

**[Why]** ⭐ What specifically makes a workflow "agentic" rather than just a single tool call?
> The repeated goal-check at each loop iteration: after every observe/act step, the model evaluates whether the goal has actually been reached. If not, it loops again; if so, it exits to a final response. It's this repeated evaluate-and-continue loop that defines "agentic," not merely having access to a tool.

**[Recall]** What motivated Google's release of the Agent-to-Agent (A2A) protocol, per this lecture?
> Once you have more than one agent (e.g. thermostat control and energy distribution agents) that need to coordinate, you need a standardized way for them to communicate — analogous to how MCP standardizes agent-to-tool communication.

**[Recall]** What does an agent expose under the A2A protocol?
> A defined set of "skills" with examples (so other agents know what it can do), plus an execution contract — what status it emits during a request, and how it handles a cancel request.

**[Why]** ⭐ Why can token/cost budgets become hard to control in a multi-agent system specifically?
> Each agent typically runs its own independent reasoning loop with its own budget consumption — costs compound across agents rather than being capped by one shared budget, so a chain of communicating agents can burn resources unpredictably even if each individual agent looks reasonable in isolation.

**[Application]** ⭐ What is a concrete data exfiltration risk once an LLM has real tool access, and why is it new?
> If an agent has both access to sensitive data and a tool capable of public-facing output (e.g. sending email), a crafted prompt could induce it to leak that data through the tool. This risk didn't exist when models only generated text — it's a direct consequence of models being able to take real actions on a user's behalf.

---

## CME 295 L8 — Evals: Measurement Theory & Bias Taxonomy
*Tier 1 · ~88% of postings · 16 cards (9 starred) · [cme295-l8-evals-cards.json](cme295-l8-evals-cards.json)*

> Companion to evals-process.json and llm-evaluation-frameworks.json. This deck covers the statistical foundations (inter-rater agreement math) and the named bias taxonomy those two don't cover.

**Sources:**
- [CME 295 Lecture 8 — Amidi brothers, Stanford](https://www.youtube.com/watch?v=8fNP4N46RRo)

**[Why]** ⭐ Why is a raw human inter-rater agreement rate (e.g. "80% agreement") not meaningful on its own?
> Two raters responding completely randomly with probability 0.5 each will still agree 50% of the time by pure chance. Without knowing the chance baseline, you can't tell if an agreement number reflects real consensus or coincidence.

**[Recall]** What does Cohen's kappa measure?
> A function of (observed agreement − chance agreement), normalized so kappa = 1 is perfect agreement, kappa = 0 is no better than random, and negative values mean agreement worse than chance. Corrects the flaw in raw agreement rate.

**[Recall]** What are Fleiss' kappa and Krippendorff's alpha?
> Extensions of Cohen's kappa for cases with more than two raters or different data types — same underlying idea (measure agreement relative to a random baseline), different formulas for different rating setups.

**[Why]** ⭐ Why do rule-based metrics like BLEU, ROUGE, and METEOR fail to reward valid stylistic variation?
> They score based on n-gram/unigram overlap against a fixed reference — two sentences that say the same thing in completely different words score poorly against each other despite being equally correct, because the metric is measuring surface lexical overlap, not meaning.

**[Recall]** What is METEOR's ordering penalty measuring?
> The number of contiguous chunks needed to align matched words between prediction and reference — fewer, longer contiguous matches means better-preserved word order and a lower (better) penalty.

**[Recall]** What is BLEU's brevity penalty for?
> BLEU is precision-focused (measures matched n-grams over the n-grams in the prediction), which means a very short translation could otherwise game the metric — the brevity penalty specifically discourages translations that are too short.

**[Application]** ⭐ Why must LLM-as-judge output be paired with structured output / constrained decoding in production?
> The judge's response is generated by a fundamentally probabilistic process, so a free-text rationale-plus-score response isn't guaranteed to be parseable. Constrained decoding (e.g. a forced JSON schema) guarantees the score can actually be extracted programmatically every time.

**[Recall]** What's the difference between pointwise and pairwise LLM-as-judge setups?
> Pointwise: rate a single response in isolation (good/bad). Pairwise: given two responses, judge which is better (A or B) — pairwise judgments can also be used to synthetically generate preference-training data for a reward model.

**[Why]** ⭐ What is position bias in LLM-as-judge, and how do you mitigate it?
> In a pairwise setup, the judge can favor whichever response appears first in the prompt, independent of actual quality. Mitigate by asking both orderings (A-vs-B and B-vs-A) and taking the majority/consistent verdict.

**[Why]** ⭐ What is verbosity bias in LLM-as-judge, and how do you mitigate it?
> Judges tend to prefer longer, more detailed responses regardless of whether they're more correct. Mitigate by explicitly instructing the judge to ignore length, adding in-context examples showing verbosity isn't the goal, or applying an explicit length penalty.

**[Why]** ⭐ What is self-enhancement bias in LLM-as-judge, and how do you mitigate it?
> A model tends to prefer outputs it generated itself, likely because self-generated text is inherently high-probability under its own distribution. Mitigate by never using the same model for both generation and judging — use a separate, typically stronger-reasoning model as judge.

**[Application]** ⭐ Why should you use low temperature (0.1-0.2) specifically for evaluation runs?
> Evaluation needs to be reproducible across repeated runs to be trustworthy — you want the same input to reliably produce the same score over time. Low temperature reduces the model's sampling randomness, which is the opposite of what you want for creative generation but exactly what you want for measurement.

**[Why]** ⭐ Why should you periodically calibrate LLM-judge scores against human ratings, even after moving away from needing humans to get started?
> The LLM judge is itself an approximation of human judgment, not the ground truth — optimizing a system against the judge's score without checking it still tracks human preference risks silently over-optimizing against a proxy that has drifted from what you actually care about.

**[Recall]** What are the two broad dimensions LLM output quality gets evaluated against?
> Task performance (was the response useful, factual, relevant) and format alignment (tone, style, safety) — most specific eval criteria are a more granular version of one of these two.

**[Application]** ⭐ How do you evaluate the factuality of a multi-sentence response where only part of it is wrong?
> Decompose the response into a list of discrete atomic facts (via an LLM call), fact-check each individually in binary fashion (often via RAG or web search against a source), optionally weight each fact by importance, then aggregate into a weighted score — rather than forcing the whole response into one binary correct/incorrect judgment.

**[Why]** Why do rule-based metrics still matter even though LLM-as-judge is more flexible and explainable?
> Rule-based metrics are cheap, fully deterministic, and don't require any model inference to run — useful as a fast, reproducible sanity-check signal even where they're too rigid to be the primary quality measure.

---

## Evals — Process & Methodology
*Tier 1 · ~88% of postings · 7 cards (3 starred) · [evals-process.json](evals-process.json)*

> Companion to llm-evaluation-frameworks.json — that deck covers the tool vocabulary (RAGAS/DeepEval/Promptfoo), this one covers the underlying process a good eval workflow follows.

**Sources:**
- [Hamel Husain & Shreya Shankar — Why AI evals are the hottest new skill](https://www.youtube.com/watch?v=BsWxPI9UM4c)

**[Recall]** What is “open coding” in LLM error analysis?
> An informal note describing the first specific thing wrong in a trace — written before you try to categorize it.

**[Recall]** What comes after open coding in the workflow?
> Using an LLM to synthesize the open codes into axial codes — named failure-mode categories.

**[Why]** ⭐ Why must an LLM-as-judge evaluator be binary (pass/fail), never a 1–5 scale?
> Likert-style scores on LLM judges are unreliable and hard to act on. Binary keeps the signal clean and forces an actual decision.

**[Recall]** What must you check before trusting an LLM judge in production?
> Its agreement with human labels, via a confusion matrix — not just a raw agreement percentage, which hides misses when errors are rare.

**[Recall]** What is “theoretical saturation”?
> The point in error analysis where you stop finding new categories of failure — your signal to stop manually labeling traces.

**[Application]** ⭐ How many LLM-judge evaluators does a typical product actually need?
> 4–7 — not one for every conceivable failure mode.

**[Concept]** ⭐ What is the “benevolent dictator” approach to evals?
> One domain expert is given authority to make the judgment calls on error analysis, instead of routing every decision through committee.

---

## Fine-Tuning vs. RAG Decision Framework
*Tier 2 · ~80% of postings · 10 cards (6 starred) · [fine-tuning-vs-rag.json](fine-tuning-vs-rag.json)*

> Per Paul's map: study for conversational fluency here, not hands-on mastery (Tier 3 depth on the raw fine-tuning mechanics). The decision framework itself is Tier 2 and worth knowing cold.

**Sources:**
- [Sebastian Raschka — Ahead of AI (Substack)](https://magazine.sebastianraschka.com/)
- [Anthropic fine-tuning docs](https://platform.claude.com/docs)
- [OpenAI fine-tuning guide](https://platform.openai.com/docs)

**[Why]** ⭐ What's the core rule for choosing RAG vs. fine-tuning?
> Put volatile knowledge in retrieval, put stable behavior in fine-tuning. RAG changes what the model knows without touching the model; fine-tuning changes how the model behaves (tone, format, task specialization) without needing to re-supply facts every call.

**[Application]** ⭐ When would you use both RAG and fine-tuning together?
> RAG supplies the knowledge (facts, documents, current information), fine-tuning shapes how the model uses and presents that knowledge (consistent output format, domain-specific tone, following your organization's conventions). Common in production: fine-tune for style/format, retrieve for facts.

**[Recall]** What is LoRA (Low-Rank Adaptation)?
> Instead of updating all of a model's weights during fine-tuning, LoRA freezes the original weights and trains a much smaller pair of low-rank matrices that get added on top — dramatically cheaper to train and store, and you can swap different LoRA adapters onto the same base model for different tasks.

**[Recall]** What does QLoRA add on top of LoRA?
> Quantizes the frozen base model to lower precision (e.g. 4-bit) before applying LoRA adapters — cuts memory requirements further, making it possible to fine-tune large models on much smaller hardware, with a small quality tradeoff from the quantization.

**[Why]** ⭐ Why is "context-first" sometimes the right call before reaching for RAG at all?
> If your knowledge base is small enough to fit in the model's context window, prompt caching plus full context can be simpler and cheaper than building a retrieval pipeline — no chunking, no embedding drift, no retrieval-quality tuning. RAG earns its complexity when the knowledge base genuinely exceeds what fits in context.

**[Recall]** What is distillation, and when is it the right use case?
> Training a smaller, cheaper model to imitate a larger frontier model's outputs on your specific task — you get most of the quality at a fraction of the inference cost. Right use case: high-volume, narrow tasks where the frontier model's full generality is wasted (e.g. classification, extraction) and cost/latency matters more than open-ended capability.

**[Why]** ⭐ What is "catastrophic forgetting" in fine-tuning, and why does it matter?
> Fine-tuning too aggressively on a narrow dataset can degrade the model's general capabilities outside that narrow task — it "forgets" broader skills while overfitting to the new one. Mitigated by techniques like LoRA (which touches far fewer parameters) and keeping fine-tuning datasets diverse enough to avoid overly narrow specialization.

**[Recall]** What is DPO (Direct Preference Optimization), and how does it differ from standard supervised fine-tuning?
> Standard fine-tuning trains on example input/output pairs. DPO trains on pairs of outputs where one is preferred over the other, directly optimizing the model to prefer the better response — a simpler, more stable alternative to full RLHF for alignment-style tuning.

**[Application]** ⭐ Your RAG-based support bot gives factually correct answers but in an inconsistent tone/format. Do you fine-tune or improve the prompt?
> Try prompting first — it's free and fast. Reach for fine-tuning only if prompting can't reliably enforce the format at scale (e.g. subtle stylistic consistency across thousands of varied queries that instructions alone don't reliably capture), since fine-tuning adds real infrastructure and maintenance cost that a better prompt or few-shot examples might avoid entirely.

**[Why]** ⭐ Why does "knowledge changes frequently" push you toward RAG and away from fine-tuning, structurally?
> Fine-tuning bakes information into model weights — updating it means re-training, which is slow and expensive to repeat often. RAG's knowledge lives in an external, swappable index — updating a document is instant and doesn't touch the model at all. Frequent-change knowledge and fine-tuning are structurally mismatched.

---

## LlamaIndex — Framework & Platform
*Tool deep-dive · maps to RAG (Tier 1) + Document AI strength area · 10 cards (4 starred) · [llamaindex.json](llamaindex.json)*

> Verified live — LlamaCloud is transitioning to be branded under LlamaParse during 2026, so if you see either name in a posting or a slightly older resource, they're referring to the same product family.

**Sources:**
- [LlamaIndex developer docs](https://developers.llamaindex.ai/python/framework/)
- [LlamaIndex Agent Workflows](https://www.llamaindex.ai/workflows)
- [Jerry Liu — Building Production-Ready RAG Applications (already in corpus)](https://www.youtube.com/watch?v=TRjq7t2Ms5I)

**[Recall]** What is a LlamaIndex "Workflow," architecturally?
> Event-driven step composition: execution is modeled as steps that consume and emit typed Events, with the runtime routing each event to whichever step subscribes to it. This is the framework's recommended way to build anything beyond a trivial single-shot RAG query — supports branching, parallelism, and human-in-the-loop review.

**[Why]** ⭐ Why does LlamaIndex model workflows as typed events rather than a simple linear pipeline?
> Real document/agent pipelines need branching (different document types need different handling), parallelism (process multiple documents concurrently), and durability (resume after a failure) — a linear pipeline can't express any of that. Typed events let each step declare exactly what it consumes and produces, making the whole workflow composable and independently testable.

**[Recall]** What is LlamaParse, specifically?
> LlamaIndex's document parsing product, powered by vision-language models (VLMs) rather than plain OCR — built to preserve semantic structure through complex layouts: nested tables, embedded charts/images, multi-column forms. This is the piece most directly relevant to Document AI work specifically.

**[Recall]** What do LlamaSplit, LlamaClassify, and LlamaExtract each do?
> LlamaSplit: intelligently separates and categorizes pages within a multi-document file (e.g. a scanned batch containing several distinct forms). LlamaClassify: classifies individual documents against custom labels you define. LlamaExtract: pulls structured data out of unstructured/semi-structured documents into a defined schema.

**[Application]** ⭐ You're building a pipeline to process a batch of scanned mixed documents (invoices, contracts, ID forms) into structured records. Which LlamaIndex pieces compose that pipeline?
> LlamaParse to extract text/layout from the scans, LlamaSplit to separate the batch into individual documents, LlamaClassify to tag each by document type, and LlamaExtract to pull each type's specific fields into structured output — a genuinely representative Document AI pipeline, not a hypothetical.

**[Why]** ⭐ Why would you reach for LlamaIndex specifically over LangGraph for a given project, architecturally?
> LlamaIndex is optimized for data-heavy, document-centric applications — 300+ data connectors, deep parsing/extraction tooling, retrieval as a first-class concern. LangGraph is optimized for orchestration-heavy agents — multi-step branching logic, durable state, retries — where the data layer is secondary to the control flow. Production stacks often use both: LlamaIndex for retrieval, LangGraph for orchestration on top.

**[Recall]** What does "fan-out/fan-in" mean in a LlamaIndex Agent Workflow, and why does it matter for document processing at scale?
> Fan-out: splitting one input into many parallel sub-tasks (e.g. one per document in a batch). Fan-in: merging their results back into a single output. This is the pattern that lets a workflow process hundreds of documents concurrently instead of one at a time, with a defined point where results converge.

**[Recall]** What agent patterns does LlamaIndex's agent layer support?
> ReAct, function-calling, and general tool-use patterns — agents are built on top of Workflows, and a RAG pipeline itself can be exposed to an agent as just one of several tools it can choose to call.

**[Why]** ⭐ Why is human-in-the-loop review a first-class feature in LlamaIndex Workflows rather than something bolted on?
> Document AI use cases (contracts, compliance, financial records) frequently can't tolerate fully autonomous decisions — a workflow needs to be able to pause, surface a low-confidence extraction for human review, and resume once approved. Building this as a native workflow primitive (not custom glue code) is what makes it usable in regulated/enterprise contexts.

**[Recall]** What is observability, as a built-in Agent Workflow feature (not a bolted-on tool)?
> The workflow runtime natively tracks which steps ran, what events they consumed/produced, and where failures occurred — giving you a debuggable trace of a multi-step document pipeline without needing to instrument it yourself with a separate tracing tool from day one.

---

## LLM Architecture & Tradeoffs
*Tier 1 · ~85% of postings · 10 cards (5 starred) · [llm-architecture.json](llm-architecture.json)*

> Foundational — watch the Amidi CME 295 lecture 1 for this one, not just cards. These give you the vocabulary; the lecture gives you the intuition an interviewer will probe for.

**Sources:**
- [Stanford CME 295 — Transformers & LLMs (Amidi brothers, Fall 2025)](https://www.youtube.com/watch?v=Ub3GoFaUcds)
- [Deep Dive into LLMs like ChatGPT — Karpathy (already in corpus)](https://www.youtube.com/watch?v=7xTGNNLPyMI)
- [Jay Alammar — The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)

**[Recall]** What is self-attention, in one sentence?
> A mechanism where every token in a sequence computes a weighted relevance score against every other token, letting the model decide which other words matter for understanding this one — regardless of distance between them.

**[Why]** ⭐ Why did Transformers replace RNNs/LSTMs as the dominant architecture?
> RNNs process tokens sequentially, so training can't parallelize across the sequence and long-range dependencies decay. Self-attention lets every token attend to every other token in one parallel step — much faster to train at scale, and no distance penalty for relating far-apart tokens.

**[Recall]** What are the Q, K, V (Query, Key, Value) vectors in attention?
> Each token produces three learned projections of itself: a Query (what am I looking for), a Key (what do I offer), and a Value (what information do I actually carry). Attention score = similarity between one token's Query and another's Key; that score weights how much of the second token's Value gets mixed in.

**[Why]** ⭐ Why does context window size directly affect both cost and quality, not just "how much you can paste in"?
> Attention cost scales roughly quadratically with sequence length (every token attends to every other token), so cost and latency grow fast as context grows. Quality also degrades well before the technical limit — models reliably use maybe the first 100-200K tokens well; beyond that, attention gets diluted and retrieval from the middle of a long context becomes unreliable (the "lost in the middle" effect).

**[Recall]** What is a Mixture-of-Experts (MoE) architecture, and why do frontier models use it?
> Instead of every token passing through the full dense network, the model routes each token to a small subset of specialized "expert" sub-networks. Lets you scale total parameter count (and thus capacity) without scaling the compute cost of every forward pass — you only pay for the experts actually activated.

**[Application]** ⭐ How do you decide between a frontier model, a mid-tier model, and a small/fast model for a given feature?
> Route by task difficulty and cost sensitivity: frontier (Opus-class) for complex reasoning/synthesis where errors are expensive; mid-tier (Sonnet-class) for the bulk of production traffic — the best cost/quality balance; small/fast (Haiku-class) for classification, routing, and high-volume simple tasks where latency and cost dominate.

**[Why]** ⭐ Why does token economics matter architecturally, not just as a billing detail?
> Cost and latency are both roughly proportional to tokens processed, so architectural choices — context length, prompt caching, model routing, retrieval instead of stuffing full documents in context — are cost-engineering decisions as much as quality decisions. A design that ignores token economics doesn't survive contact with a production budget.

**[Recall]** What's the practical difference between open-weight models (Llama, Qwen, DeepSeek) and closed/proprietary APIs (Claude, GPT)?
> Open-weight: you can self-host, fine-tune freely, and control data residency — but you own the infrastructure, serving, and update burden. Closed API: zero infrastructure, always current, typically higher ceiling capability — but you depend on the vendor's uptime, pricing, and data-handling terms.

**[Why]** ⭐ Why do reasoning models (o1/o3, DeepSeek R1) behave differently from standard chat models architecturally?
> They're trained with reinforcement learning on verifiable problems (math, code) to discover effective reasoning strategies through trial and error, rather than just imitating human-written responses. This produces emergent behaviors like backtracking and self-correction — but makes them slower and more expensive per response, since they spend tokens "thinking" before answering.

**[Recall]** What is tokenization, and what's one practical failure mode it causes?
> Text gets broken into sub-word chunks (tokens) before the model ever sees it — the model reasons over tokens, not characters. This causes blind spots on character-level tasks: a model can fail to count letters in a word correctly because it never actually "sees" the individual characters, only the token they're bundled into.

---

## LLM Evaluation Frameworks
*Tier 1 · ~88% of postings · 10 cards (5 starred) · [llm-evaluation-frameworks.json](llm-evaluation-frameworks.json)*

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

**[Why]** ⭐ Why is "context precision" alone not enough to judge a RAG system?
> You can have perfectly relevant retrieved chunks (high precision) but still miss chunks that were needed (low recall) — an answer built on relevant-but-incomplete context. You need both dimensions, broken down by failure type, not one composite score.

**[Recall]** What's the core architectural difference between DeepEval and Promptfoo?
> DeepEval is Python/pytest-native — evals run as unit tests and fail your CI build on a metric threshold breach. Promptfoo is a config-driven (YAML), language-agnostic CLI built for side-by-side prompt/model comparison and has a much stronger red-teaming/security-scanning engine (40+ attack types).

**[Why]** ⭐ Why do mature eval stacks run both DeepEval and Promptfoo instead of picking one?
> They answer different questions: Promptfoo answers "can an attacker break this" (jailbreaks, injection, excessive agency); DeepEval answers "does this meet our quality bar" (faithfulness, hallucination, relevancy). Different failure modes, different tools, both run as CI gates before deploy.

**[Application]** ⭐ In an LLM-as-judge setup, why should the judge always output binary pass/fail rather than a 1-5 score?
> 1-5 scores collapse into noise — humans and models disagree on what a "3" means, and the score doesn't map to an action. Binary forces a decision and can be directly validated against human labels with a confusion matrix.

**[Why]** ⭐ Why must you validate an LLM judge against human labels before trusting it in production?
> A judge can silently be biased — e.g., always saying "pass" — and still show high raw agreement if real failures are rare. A confusion matrix breaks that down cell by cell so you see exactly where the judge is wrong, not just an aggregate percentage.

**[Recall]** What's the difference between a "unit eval" and a "regression eval"?
> Unit eval tests a single LLM call/component in isolation before deploy, like a unit test. Regression eval runs continuously against production traffic or a fixed dataset to catch silent drift — a model or prompt change degrading quality without an obvious error.

**[Recall]** What is G-Eval (used in DeepEval)?
> A metric that uses an LLM with chain-of-thought reasoning to score outputs against a custom rubric you define in natural language — more flexible than fixed metrics like BLEU/ROUGE, but still needs validation against human judgment like any LLM-judge.

**[Why]** ⭐ Why is evals now a core product-building skill instead of a QA afterthought?
> You can't productively iterate on a model or prompt without a way to measure whether a change helped — evals are the feedback loop, not a compliance checkbox. Teams that skip them end up debugging by vibes.

---

## MCP, A2A & Agent Governance
*Tier 2 · MCP ~65%, Governance ~78% · 10 cards (5 starred) · [mcp-a2a-governance.json](mcp-a2a-governance.json)*

**Sources:**
- [Model Context Protocol spec](https://modelcontextprotocol.io)
- [A2A Protocol spec](https://a2a-protocol.org)
- [Mahesh Murag — Building Agents with MCP (full workshop)](https://www.youtube.com/watch?v=kQmXtrmQ5Zg)
- [Where AI governance is headed — Databricks / ThoughtWorks](https://www.youtube.com/watch?v=UrhnwOPJG4w)

**[Recall]** What are the three core interfaces MCP defines?
> Tools (model-controlled actions the agent can invoke), Resources (application-controlled data the client exposes), and Prompts (user-controlled templates) — each serves a distinct role in the client-server interaction.

**[Why]** ⭐ Why does MCP separate "tools" from "resources" instead of treating everything as one kind of capability?
> Tools are actions with side effects that the model decides to invoke; resources are read-only data the application decides to expose. Different control planes need different permission models — you don't want a model deciding what data to expose, or an app deciding what actions to take.

**[Why]** ⭐ What problem does MCP solve architecturally?
> Before MCP, every AI app needed a custom integration for every tool/data source — N apps x M tools = N x M integrations. MCP standardizes the interface so one MCP server works with any MCP-compatible client, collapsing N x M into N + M.

**[Recall]** What is "sampling" in MCP?
> An MCP server can request an LLM completion FROM the client rather than needing its own model access — servers stay lightweight (no API key, no model management) while the client controls cost, privacy, and model choice.

**[Why]** ⭐ How does MCP differ from A2A, and why do you need both?
> MCP connects an agent to its tools/data (agent-to-tool). A2A connects independent agents to each other so they can discover, delegate to, and collaborate with agents built on different frameworks (agent-to-agent). Use MCP to equip one agent; use A2A to let that agent work with other agents outside your system.

**[Recall]** What does "composability" mean in MCP's architecture?
> Any application can be both an MCP client and an MCP server simultaneously — enabling layered/hierarchical architectures where one agent's output becomes another agent's tool, without a different protocol at each layer.

**[Application]** ⭐ Why does fixed role-based permissions (RBAC) fail for AI agents in enterprise governance?
> An agent's permissions need to be scoped to the specific task/context at runtime, not a fixed role like "support-agent-can-read-all-customers." Fixed roles are too broad for agents operating across many different contexts moment to moment — capabilities need to be short-lived and use-case specific.

**[Recall]** What is "tainting" as an agent sandboxing technique?
> If an agent reads from a sensitive data source, it gets flagged/tainted and is then prevented from writing to any non-sensitive downstream location — stops sensitive data from silently leaking through an agent's output path.

**[Recall]** What are the five foundational primitives for enterprise agent governance?
> Identity (agents need their own, separate from human users), Capabilities (short-lived, scoped permissions), Sandboxing (containment, tainting), Observability (execution tracing), Resource accounting (real-time token/cost control, not month-end reconciliation).

**[Why]** ⭐ Why must token/resource costs for agents be controlled in real time rather than reconciled after the fact?
> Agents can loop, retry, and compound costs unpredictably in ways a human-driven system never would — a runaway loop can burn thousands of dollars before a monthly bill would surface the problem. Cost needs to be a live control surface (circuit breakers, budgets), not an accounting exercise.

---

## MLOps / LLMOps
*Tier 2 · ~75% of postings · 10 cards (6 starred) · [mlops-llmops.json](mlops-llmops.json)*

> Verified via live search this session, not just recalled — tool landscape here shifts fast enough to be worth re-checking periodically.

**Sources:**
- [MLflow — Top LLM Observability Tools 2026](https://mlflow.org/articles/top-llm-observability-tools-in-2026-a-pro-guide/)
- [LangSmith docs](https://docs.smith.langchain.com)
- [Arize Phoenix docs](https://docs.arize.com/phoenix)

**[Why]** ⭐ Why do mature LLMOps stacks combine 2-3 specialized tools instead of using one platform?
> No single tool covers the full stack well: tracing (LangSmith/Promptflow), observability/RAG debugging (Arize/Langfuse), model registry/versioning (MLflow), and cost/routing (an LLM gateway like Portkey/LiteLLM) are different concerns with different leaders. Combining specialized tools beats one mediocre generalist.

**[Recall]** Why is MLflow often called the "safest, most portable" choice for LLM observability?
> It's open source, vendor-neutral, and runs anywhere — laptop, Kubernetes, any cloud. You're not locked into one vendor's ecosystem, which matters if your infrastructure or vendor choices change over the life of the product.

**[Why]** ⭐ When would you choose LangSmith over MLflow for observability?
> LangSmith has tight, purpose-built integration with LangChain primitives and a polished UI for trace inspection specifically in that ecosystem. If you're already deep in LangChain/LangGraph, the integration surface is narrower to set up than a general-purpose tool — but it's a weaker fit if your stack uses custom or heterogeneous orchestration.

**[Why]** ⭐ Why does Arize Phoenix specifically target RAG debugging rather than general LLM observability?
> It has built-in support for embedding drift detection, retrieval relevance scoring, and document-level attribution — the specific failure modes that are unique to retrieval pipelines and that generic LLM tracing tools don't model. Best choice when your production problems are specifically "is retrieval working," not just "is the model working."

**[Recall]** What is distributed span-based tracing, applied to an LLM/agent system?
> Capturing every step of a request — inputs, outputs, tool calls, retrieval steps — as a linked chain of spans, so you can reconstruct exactly what happened for any single production request. Essential for debugging multi-step agent failures where the final wrong answer could stem from any of several upstream steps.

**[Why]** ⭐ Why does prompt versioning need the same discipline as code versioning?
> An unversioned prompt change is a silent behavior change with no audit trail — you can't answer "what changed" when quality regresses, and you can't roll back cleanly. Treating prompts like code (versioned, reviewable, revertible) closes that gap.

**[Recall]** What are the four broad categories LLM evaluation metrics generally fall into for production monitoring?
> Semantic quality (is the answer correct and useful), operational efficiency (latency, cost, throughput), agent behavior (did it call the right tools, complete the task), and regression monitoring (did quality drift from a previous baseline).

**[Why]** ⭐ Why is drift detection specifically important for LLM systems, when the model itself isn't being retrained?
> Even with a frozen model, the input distribution can shift (users ask new kinds of questions), the underlying data your RAG retrieves from changes, or the vendor quietly updates the model behind an API alias — any of these silently degrades quality without triggering an obvious error. Drift monitoring catches the "it still runs, it's just gotten worse" failure mode.

**[Application]** ⭐ You're setting up observability for a new production agent. What's the minimum viable stack?
> One tracing tool to capture the full span chain (what happened, in order), one eval framework running as a CI gate before deploy, and cost/token monitoring with alerting thresholds. Add RAG-specific or multi-agent-specific tooling only once you have a concrete problem in that area — don't over-instrument before you know what you're debugging.

**[Recall]** What's the difference between MLOps and LLMOps as disciplines?
> MLOps covers the classical ML lifecycle: data pipelines, training, model registry, deployment, monitoring for a trained model with fixed inputs/outputs. LLMOps adds LLM-specific concerns on top: prompt versioning, token/cost management, retrieval pipeline monitoring, and evaluating open-ended generative output where there's no single "correct" label to check against.

---

## Production AI Deployment
*Tier 1 · ~88% of postings · 10 cards (5 starred) · [production-ai-deployment.json](production-ai-deployment.json)*

**Sources:**
- [Sherwin Wu — OpenAI head of platform engineering (already in corpus)](https://www.youtube.com/watch?v=B26CwKm5C1k)
- [AWS Bedrock docs](https://docs.aws.amazon.com/bedrock/)
- [Google Vertex AI docs](https://cloud.google.com/vertex-ai/docs)

**[Recall]** What's the practical difference between batch and streaming inference deployment?
> Batch: process many requests together on a schedule, optimized for throughput and cost — fine when latency doesn't matter (nightly report generation). Streaming: process each request as it arrives, optimized for low latency — required for interactive chat/agent experiences where a user is waiting.

**[Why]** ⭐ Why does a model-serving layer exist separately from the model itself in production architecture?
> The serving layer handles request batching, load balancing across replicas, caching, rate limiting, and version routing — concerns that are about running the model reliably at scale, not about the model's intelligence. Conflating the two makes both harder to reason about and scale independently.

**[Recall]** What is a canary deployment, applied to an AI model or prompt change?
> Route a small percentage of production traffic to the new model/prompt version while the majority stays on the current one — lets you catch quality regressions on real traffic before a full rollout, with limited blast radius if something's wrong.

**[Why]** ⭐ Why do latency, reliability, and cost trade off against each other in model selection for a production feature?
> A more capable model is usually slower and more expensive per call; a faster/cheaper model may need more retries or fallback logic to hit the same reliability bar. There's rarely a model that wins on all three — the right choice depends on which constraint is tightest for that specific feature (a real-time chat needs latency; a batch analysis job needs cost efficiency).

**[Recall]** What does "model versioning" actually protect you against in production?
> Silent behavior drift — a vendor updating a model behind an API alias, or your own prompt change, subtly altering outputs in ways that don't throw errors but degrade quality. Pinning to a specific version and testing before upgrading is how you catch this before users do.

**[Application]** ⭐ Your AI feature works fine in testing but is unreliable in production under load. What's the first thing to check?
> Rate limits and timeout handling under concurrency — AI API calls are slow relative to typical web requests, so load that's fine for a normal API can exhaust connection pools or hit provider rate limits fast. Check retry/backoff logic and whether failures degrade gracefully (fallback response) or cascade.

**[Why]** ⭐ Why is a fallback/degraded-mode path a required part of AI production architecture, not a nice-to-have?
> AI providers have outages and rate limits like any external dependency, but an AI feature failing often means a core user-facing capability just disappears. A defined fallback (cached response, simpler rule-based behavior, clear error state) keeps the product functional instead of broken when the model call fails.

**[Recall]** What's the role of Docker/containerization specifically for AI model deployment, versus general software?
> Same core benefit as any software — reproducible environments, dependency isolation — but matters more for AI because of heavy, version-sensitive dependencies (specific CUDA/PyTorch versions, model weight files) that are easy to get subtly wrong outside a pinned container.

**[Why]** ⭐ Why does CI/CD for AI systems need to include evals as a gate, not just standard unit tests?
> Standard tests check that code doesn't crash and logic is correct; they can't catch "the model's answers got subtly worse" after a prompt or model change. Evals-as-CI-gate (running your eval suite before merge/deploy) is the AI-specific addition that catches quality regression the way unit tests catch functional regression.

**[Recall]** What's the difference between horizontal scaling for a typical web service and for an AI-serving system?
> Typical web services scale by adding stateless application replicas behind a load balancer — cheap and fast. AI serving often needs GPU-backed replicas, which are expensive and slower to spin up, so autoscaling has to account for cold-start time and cost much more carefully — over-provisioning is expensive, under-provisioning causes queueing/latency spikes.

---

## Prompt Engineering
*Tier 1 · ~85% of postings · 10 cards (6 starred) · [prompt-engineering.json](prompt-engineering.json)*

**Sources:**
- [Claude Platform Docs](https://platform.claude.com/docs)
- [OpenAI Platform Docs](https://platform.openai.com/docs)
- [Prompt Caching: Cut Your AI Cost by 90% (already in corpus)](https://www.youtube.com/watch?v=HDMqDV7mmGo)
- [Kevin Weil — OpenAI CPO on model maximalism (already in corpus)](https://www.youtube.com/watch?v=scsW6_2SPC4)

**[Recall]** What is chain-of-thought (CoT) prompting?
> Instructing the model to reason step-by-step before giving a final answer rather than jumping straight to it — generating intermediate reasoning tokens measurably improves accuracy on multi-step problems, especially math and logic.

**[Why]** ⭐ Why do system prompts matter more than user-turn instructions for consistent behavior?
> The system prompt sets persistent context, persona, and constraints that apply across the entire conversation, while user turns are one-off requests. Putting stable rules (tone, format, boundaries) in the system prompt keeps behavior consistent even as users phrase requests differently turn to turn.

**[Recall]** What is few-shot prompting, and when does it help most?
> Providing 2-5 example input/output pairs in the prompt before the real request — most useful when the desired output format or style is unusual or hard to describe in words alone; the examples do the specifying that instructions can't.

**[Why]** ⭐ What is structured output (e.g. forced JSON) and why does it matter for production systems?
> Constraining the model's output to a specific schema rather than free text. Critical for production because downstream code needs to parse the response reliably — free text requires fragile regex/parsing that breaks on format drift.

**[Why]** ⭐ Why is "tool calling" considered a prompt-engineering skill, not just an API feature?
> How you name and describe a tool — its parameters, when to use it vs. not — directly determines whether the model calls it correctly and at the right moment. A poorly described tool gets misused or ignored regardless of how good the underlying function is; the tool description IS a prompt.

**[Application]** ⭐ When should you use XML-style tags to structure a prompt versus plain prose?
> When a prompt has multiple distinct sections the model needs to treat differently (e.g. <context>, <instructions>, <examples>) — tags give the model unambiguous boundaries, reducing the chance it conflates instructions with reference material, especially in long prompts.

**[Recall]** What is prompt caching, and what's the practical benefit?
> Marking a portion of the prompt — a long system prompt or document — as reusable across calls so the model doesn't reprocess it from scratch each time. Cuts both cost and latency significantly for repeated or similar requests.

**[Why]** ⭐ Why does "put it in context" usually beat "hope the model remembers it" for anything important?
> The context window is the model's working memory — directly accessible and precise. Parametric/trained-in knowledge is more like vague recollection, prone to blending facts or hallucinating specifics. If a fact matters, include it explicitly rather than trusting recall.

**[Recall]** What's the difference between zero-shot, few-shot, and fine-tuned approaches to getting a specific model behavior?
> Zero-shot: instructions only, fastest to try, least reliable for unusual formats. Few-shot: instructions plus examples, better format-fidelity, costs context tokens every call. Fine-tuned: the behavior is baked into the weights — most reliable and cheapest per-call at scale, but requires training data and infrastructure.

**[Why]** ⭐ Why does "model maximalism" change how you should prompt-engineer today?
> Building elaborate prompt scaffolding to work around a model's current weaknesses is a bet that pays off short-term but gets obsoleted as the model improves every 2-3 months — the scaffolding becomes dead weight. Design for where the model is heading, not just where it is today.

---

## RAG Architecture
*Tier 1 · ~95% of postings · 48 cards (22 starred) · [rag-architecture.json](rag-architecture.json)*

**Sources:**
- [LlamaIndex framework docs](https://developers.llamaindex.ai/python/framework/)
- [Jerry Liu — Building Production-Ready RAG Applications](https://www.youtube.com/watch?v=TRjq7t2Ms5I)

**[Why]** ⭐ Why does chunk size matter so much in RAG, and how do you pick it?
> Too small loses context and answers feel fragmented; too large dilutes the embedding's signal and retrieval gets noisy. It's dataset-specific and empirically tuned — start around 512-1024 tokens with 10-20% overlap, then measure retrieval precision/recall as you adjust.

**[Recall]** What's the difference between fixed-size and semantic chunking?
> Fixed-size splits by token count regardless of content boundaries. Semantic chunking splits at natural breakpoints (paragraph, topic shift) detected via embedding similarity between adjacent sentences — better coherence, more expensive to compute.

**[Why]** ⭐ Why combine BM25 (sparse) with dense embedding retrieval instead of using just one?
> BM25 catches exact keyword/entity matches (SKUs, names, acronyms) that embeddings can blur together. Dense embeddings catch semantic/paraphrase matches BM25 misses entirely. Hybrid covers both failure modes.

**[Recall]** What is Reciprocal Rank Fusion (RRF)?
> A method for merging ranked result lists from multiple retrievers by scoring each document as the sum of 1/(k + rank) across all lists — a document ranked high in either list rises to the top of the merged list, without needing to normalize disparate score scales.

**[Why]** ⭐ Why add a reranking step after initial retrieval instead of just retrieving more precisely upfront?
> Initial retrieval (BM25/dense) has to be fast across millions of docs, trading precision for speed. A reranker (often a cross-encoder) re-scores only the top-k candidates with a far more expensive, accurate model — you get retrieval's speed and reranking's precision.

**[Recall]** What's the difference between a bi-encoder and a cross-encoder for retrieval?
> Bi-encoder embeds query and document separately, then compares vectors — fast, used for initial retrieval at scale. Cross-encoder feeds query+document together into one model for a joint relevance score — slow but far more accurate, used only on the small reranking shortlist.

**[Why]** ⭐ Why do low precision and low recall in retrieval require different fixes?
> Low precision (irrelevant chunks retrieved) drives hallucination risk — fix with better reranking/filtering. Low recall (missing necessary info) causes incomplete answers — fix with chunking strategy, higher k, or query expansion.

**[Recall]** What is "small-to-big" retrieval?
> Embed and search over small units (sentences) for retrieval precision, but expand to a larger surrounding window (parent paragraph/section) at synthesis time — precise matching, full context for the answer.

**[Application]** ⭐ When would you fine-tune an embedding model instead of just swapping to a better off-the-shelf one?
> When your domain vocabulary is highly specialized (legal, medical, internal jargon) and general embeddings cluster your domain's distinct concepts together — fine-tuning on synthetic query-document pairs from your own corpus teaches the model your domain's actual semantic distinctions.

**[Recall]** What does "context precision" measure in a RAG eval, and how does it differ from "context recall"?
> Precision: of the chunks you retrieved, what fraction were actually relevant (signal-to-noise). Recall: of the chunks needed to answer, what fraction did you actually retrieve (completeness). A system can have perfect precision and terrible recall.

**[Recall]** What is hierarchical chunking?
> Building multiple levels of chunks over the same document — e.g. document-level, section-level, paragraph-level — so retrieval can match at whichever granularity fits the query, rather than committing to one fixed chunk size for every kind of question.

**[Why]** ⭐ Why use overlapping chunks instead of clean, non-overlapping splits?
> A clean split can sever a sentence or idea exactly at the boundary, losing context on both sides. A 10-20% overlap means the same content appears in two adjacent chunks, so a fact split awkwardly by the boundary is still fully present in at least one chunk.

**[Application]** ⭐ How should you chunk a document containing a large table differently from prose?
> Splitting a table by token count mid-row destroys its meaning — a chunk needs to preserve enough row/column context to be interpretable alone (e.g. keep headers attached to every chunk of the table, or treat the whole table as one chunk with a text summary). Prose chunking rules don't transfer to structured content.

**[Recall]** What's the difference between document parsing and chunking as pipeline stages?
> Parsing extracts clean, structured text (and layout information) from a raw file format — PDF, scanned image, HTML. Chunking then splits that already-clean text into retrieval units. Skipping good parsing (e.g. naive PDF text extraction that mangles tables) undermines every later stage no matter how good your chunking strategy is.

**[Why]** ⭐ Why does extracting metadata during ingestion (not just raw text) matter for retrieval quality?
> Metadata (date, author, document type, section title) enables filtering that pure semantic search can't do on its own — "policy documents from after 2024" isn't a semantic concept, it's a structured filter. Metadata extracted once at ingestion time is reused on every future query for free.

**[Recall]** What is multimodal RAG?
> Retrieving over more than plain text — embedding and indexing images, tables, and charts alongside prose so a query can surface a relevant diagram or figure, not just paragraphs. Requires embedding models capable of representing non-text content in a comparable vector space.

**[Why]** ⭐ What problem does "late chunking" solve that standard chunking doesn't?
> Standard chunking embeds each chunk in isolation, so a chunk loses access to context from the rest of the document while being embedded. Late chunking embeds the full document first (capturing full-document context in each token's representation), then splits into chunks afterward — each chunk's embedding still reflects the whole document's context.

**[Recall]** What's the difference between sentence-level and document-level embeddings, and when does each fit?
> Sentence-level: fine-grained, precise matching, but loses surrounding context and can be noisy for broad questions. Document-level: captures overall theme and context, but is too coarse to pinpoint a specific fact. Most production systems embed at a middle granularity (paragraph/section) as the practical compromise.

**[Why]** ⭐ What is embedding drift, and why is it an operational risk, not just a modeling detail?
> If you change your embedding model version, every previously-indexed vector is now in a different semantic space than newly-embedded content — mixing them silently degrades retrieval quality with no obvious error. This is why embedding model upgrades require a deliberate re-index, not a casual swap.

**[Recall]** What are Matryoshka embeddings, and why do they matter for cost?
> Embeddings trained so that truncating the vector to a shorter length (e.g. 256 dimensions instead of 1536) still produces a usable, if less precise, representation. Lets you trade retrieval quality for storage/compute cost dynamically, without needing a separate smaller model.

**[Application]** ⭐ How would you choose between OpenAI, Cohere, and an open-source embedding model for a new RAG system?
> Benchmark on your own eval set, not a public leaderboard — embedding quality is domain-dependent. Factor in data residency (open-source/self-hosted keeps data in-house), cost at your expected query volume, and whether you'll eventually want to fine-tune (open-source models are fine-tunable, most hosted APIs are not).

**[Recall]** What's the difference between symmetric and asymmetric embedding setups?
> Symmetric: query and document are embedded with the same model/approach, assuming they're similar in length and style (e.g. matching two similar sentences). Asymmetric: uses separate encoders tuned for queries (short, question-like) versus documents (long, statement-like) — matches the real mismatch in RAG, where a short question retrieves long passages.

**[Recall]** What is Maximal Marginal Relevance (MMR), and what problem does it solve?
> A retrieval re-ranking method that balances relevance against diversity — instead of returning the top-k most similar chunks (which can be near-duplicates of each other), MMR penalizes redundancy so the returned set covers more distinct information relevant to the query.

**[Recall]** What is query expansion / query rewriting in RAG?
> Using an LLM to reformulate or expand the user's raw query before retrieval — adding synonyms, resolving ambiguous pronouns, or breaking a compound question into sub-queries — because the user's literal wording is often a worse retrieval query than a cleaned-up version of their intent.

**[Recall]** What is HyDE (Hypothetical Document Embeddings)?
> Instead of embedding the user's question directly, first ask an LLM to generate a hypothetical answer to the question, then embed and search using that hypothetical answer. Works because a plausible answer is often closer in embedding space to real answer documents than the question itself is.

**[Recall]** What is multi-query retrieval?
> Generating several rephrased versions of the user's query (via an LLM), running retrieval for each independently, then merging and deduplicating the results — increases recall by covering multiple phrasings of the same underlying information need.

**[Application]** ⭐ How do you tune the "k" parameter (number of retrieved chunks) for a production RAG system?
> There's a real tradeoff, not just "more is safer": too low risks missing needed context (low recall); too high adds noise, cost, and can push relevant content into the "lost in the middle" zone of the prompt. Tune empirically against your eval set — start conservative (k=3-5), measure, and increase only if recall is the demonstrated bottleneck.

**[Recall]** What is self-query retrieval?
> An LLM parses the user's natural-language query into two parts: a structured metadata filter (e.g. date range, category) and a semantic search query — then both are applied together. Lets users ask naturally ("recent policy docs about X") while still getting the precision of structured filtering.

**[Why]** ⭐ In one sentence each, how do sparse, dense, and hybrid retrieval differ?
> Sparse (BM25): exact keyword/term matching, no semantic understanding. Dense (embeddings): semantic similarity, can miss exact terms. Hybrid: runs both and fuses results, covering each approach's blind spot.

**[Recall]** What is GraphRAG, and when does it beat plain vector search?
> Building a knowledge graph of entities and their relationships from your documents, then retrieving by traversing that graph rather than (or alongside) vector similarity. Beats vector search when answers require multi-hop reasoning across explicitly related entities — "who reports to the person who approved X" is a graph traversal, not a similarity match.

**[Why]** ⭐ What is the "lost in the middle" problem, and why does it matter for RAG specifically?
> LLMs reliably attend to information at the start and end of a long context but are measurably worse at using information buried in the middle. In RAG, this means naively stuffing many retrieved chunks into the prompt can cause the model to miss the one chunk that actually answers the question — ordering and chunk count both matter, not just retrieval accuracy.

**[Recall]** What is map-reduce synthesis in a RAG context?
> For questions requiring information spread across many chunks/documents: independently summarize or answer from each chunk ("map"), then combine those partial answers into one final answer ("reduce") — used when too much retrieved content to fit in one context window at once.

**[Recall]** What is refine-based synthesis, and how does it differ from map-reduce?
> Process retrieved chunks sequentially, updating a running draft answer with each new chunk rather than summarizing chunks independently in parallel. More context-aware than map-reduce (each step sees the evolving answer) but strictly sequential, so slower.

**[Why]** ⭐ Why does citation/attribution matter in a RAG answer beyond just "nice to have"?
> It's the mechanism that lets a user verify a claim without trusting the model blindly — critical in any regulated or high-stakes domain, and it also gives you a built-in signal for catching hallucination: if the answer cites nothing, or cites a chunk that doesn't actually support the claim, that's a detectable failure mode.

**[Why]** ⭐ What's the risk of "context stuffing" — just retrieving generously and cramming everything into the prompt?
> Beyond cost, it actively degrades answer quality via the lost-in-the-middle effect and dilutes the signal-to-noise ratio the model has to reason over — more context is not free, and past a point it makes answers worse, not just more expensive.

**[Recall]** What is a router / query engine in a RAG system?
> A component (often LLM-driven) that decides, per incoming query, which retrieval strategy or data source to use — e.g. route factual lookups to a vector index but analytical questions to a SQL engine. Lets one system handle heterogeneous query types instead of forcing everything through one retrieval path.

**[Recall]** What's the difference between offline and online RAG evaluation?
> Offline: run your eval suite against a fixed, curated dataset before deploying a change — controlled, repeatable, catches regressions pre-release. Online: monitor real production traffic and outcomes continuously — catches issues offline eval can't anticipate (real user phrasing, data drift, edge cases you didn't think to test).

**[Recall]** What is a "golden dataset" for RAG evaluation?
> A curated set of representative queries paired with verified correct answers and/or the specific source chunks that should be retrieved for each — your ground truth for measuring retrieval and answer quality objectively, rather than eyeballing outputs.

**[Why]** ⭐ Why does retrieval latency budget matter as a distinct concern from retrieval quality?
> A more thorough retrieval strategy (multi-query, reranking, graph traversal) generally takes longer — in an interactive product, users have a latency tolerance that caps how much retrieval sophistication you can afford, independent of whether it would improve answer quality. Production RAG design is a joint optimization, not quality-only.

**[Why]** ⭐ Why do stale embeddings become a real production problem as source documents update?
> If a source document changes but its vector index entry doesn't get re-embedded, retrieval keeps serving outdated content indefinitely with no obvious symptom — the system just quietly gives wrong answers about anything that changed. Requires a defined re-indexing trigger tied to document updates, not a one-time ingestion job.

**[Recall]** What does incremental indexing solve that a full re-index doesn't?
> Full re-indexing reprocesses the entire corpus, which becomes slow and expensive as it grows. Incremental indexing updates, adds, or deletes only the specific vectors affected by a specific document change — necessary for any system where the underlying document set changes frequently.

**[Why]** ⭐ Why is access control a RAG-specific architectural concern, not just a general app-security checkbox?
> A retrieval system can surface exactly the sensitive content a user shouldn't see if permissions aren't enforced at the retrieval layer itself — filtering only at the UI layer after retrieval is too late, since the content already reached the LLM's context and could leak into the generated answer.

**[Application]** ⭐ What should a RAG system do when retrieval finds no genuinely relevant documents for a query?
> Explicitly say so rather than forcing an answer from irrelevant chunks — a defined fallback behavior ("I don't have information on that") is safer than letting the model generate a plausible-sounding but ungrounded answer, which is one of the most common and damaging RAG failure modes.

**[Recall]** What is agentic RAG?
> Instead of a fixed retrieve-then-generate pipeline, an agent decides whether to retrieve at all, what to retrieve, and whether the retrieved information is sufficient before answering — potentially retrieving iteratively, reformulating queries, or querying multiple sources based on what it finds.

**[Recall]** What's the difference between single-hop and multi-hop RAG?
> Single-hop: one retrieval step answers the question directly. Multi-hop: answering requires chaining several retrieval steps, where the result of one retrieval informs what to search for next (e.g. "who is the CEO of the company that acquired X" requires finding the acquirer, then finding its CEO).

**[Why]** ⭐ What is Corrective RAG (CRAG), and why add a self-evaluation step?
> The system evaluates the quality/relevance of retrieved documents before generating an answer, and if retrieval quality is judged poor, it can trigger a fallback (broader search, web search, or an explicit "insufficient information" response) instead of generating from weak context — catches bad retrieval before it becomes a bad answer.

**[Recall]** What is a multi-document agent, and how does it differ from a standard multi-document retrieval?
> Instead of treating documents as passive text chunks to search over, each document is modeled as its own tool (e.g. "summarize" and "Q&A" functions scoped to that one document) that an agent can choose to call — enables more complex, multi-step reasoning across documents than a single retrieval pass allows.

**[Why]** ⭐ Is parent-document retrieval the same thing as small-to-big retrieval?
> Same underlying idea, different framing: both embed at a small, precise granularity but expand context at synthesis time. "Small-to-big" describes it as a granularity ladder; "parent-document retrieval" names the mechanism (return the parent chunk/document containing the matched child chunk) — worth knowing both terms, since different sources use different names for essentially the same technique.

---

## Vector Databases
*Tier 2 · ~70% of postings · 10 cards (6 starred) · [vector-databases.json](vector-databases.json)*

**Sources:**
- [Qdrant docs](https://qdrant.tech/documentation/)
- [Pinecone docs](https://docs.pinecone.io)
- [pgvector (PostgreSQL extension)](https://github.com/pgvector/pgvector)
- [Weaviate docs](https://weaviate.io/developers/weaviate)

**[Recall]** What does HNSW stand for, and what problem does it solve?
> Hierarchical Navigable Small World — an approximate nearest-neighbor search algorithm. It builds a multi-layer graph of vectors so search can skip through the graph in roughly logarithmic time instead of comparing against every vector, trading a small amount of accuracy for massive speed at scale.

**[Why]** ⭐ Why is nearest-neighbor search "approximate" in production vector databases, not exact?
> Exact nearest-neighbor search requires comparing the query against every vector in the database — fine for thousands of vectors, infeasible at millions. Approximate methods like HNSW sacrifice a small amount of recall for orders-of-magnitude speedup, which is the right tradeoff for almost all real applications.

**[Recall]** What's the practical tradeoff between HNSW and IVFFlat indexing?
> HNSW: better query speed and recall, but higher memory usage and slower index build/insert time. IVFFlat (inverted file, flat storage): clusters vectors into buckets first, cheaper to build and update, but generally lower recall for the same speed — often preferred when writes are frequent or memory is constrained.

**[Application]** ⭐ When would you choose pgvector over a dedicated vector database like Pinecone or Qdrant?
> When your vector data needs to live alongside relational data you're already querying with SQL — joins, transactions, existing Postgres infrastructure and ops knowledge. You trade some scale ceiling and specialized performance for operational simplicity and one less system to run.

**[Why]** ⭐ Why do managed vector DBs (Pinecone, Weaviate Cloud) vs. self-hosted (pgvector, Qdrant OSS) matter as a build-vs-buy decision?
> Managed: no ops burden, scales automatically, but recurring cost and less control over data residency. Self-hosted: full control, often cheaper at scale, but you own uptime, scaling, and backups. This is the same build-vs-buy tradeoff that shows up everywhere in AI infra — not unique to vector stores.

**[Recall]** What is metadata filtering in a vector search, and why does it matter for retrieval precision?
> Attaching structured fields (date, category, author, permission level) to each vector so a query can combine semantic similarity with SQL-like WHERE-clause filtering — e.g. "semantically similar AND published after 2024 AND visible to this user." Dramatically improves precision over pure similarity search alone.

**[Why]** ⭐ Why can hybrid search (vector + metadata filter + keyword) outperform pure vector similarity, even with a great embedding model?
> Embeddings capture semantic meaning but can miss exact-match requirements (a specific product ID, a required date range, a permission boundary) that aren't really "semantic" at all. Combining retrieval modes covers both what the model understands conceptually and what the system needs to enforce structurally.

**[Recall]** What is vector quantization, and why would you use it?
> Compressing vector representations (e.g. from 32-bit floats to 8-bit integers or binary) to cut memory footprint and speed up distance calculations — at the cost of some precision. Matters a lot at scale: a billion-vector index in full precision can be prohibitively expensive to hold in memory.

**[Application]** ⭐ How do you decide the right embedding dimensionality for your use case?
> Higher dimensions capture more nuance but cost more to store and search, and don't always improve retrieval quality proportionally. Start with what your embedding model natively outputs, benchmark retrieval quality against your own eval set, and only reduce (via a smaller model or dimensionality reduction) if storage/latency actually becomes the bottleneck — don't optimize this before you've measured it.

**[Why]** ⭐ Why does re-indexing become a real operational concern as your corpus grows, and how do teams avoid full re-indexes?
> Changing your embedding model means every existing vector is now in a different semantic space than new ones — you can't mix old and new vectors safely. Full re-indexing at scale is slow and costly, so production systems often version their indexes and cut over gradually, or design embedding pipelines so model upgrades are rare, deliberate events, not casual swaps.

---
