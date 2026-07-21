# CME 295 — Transformers & LLMs, Lecture 7: Tool Calling & Agents

**Instructors:** Afshine Amidi & Shervine Amidi (Stanford, Fall 2025)
**Source:** https://www.youtube.com/watch?v=h-7S6HNq0Vg
**Maps to:** Agentic AI / Multi-Agent Systems (Tier 1, ~90%), MCP/A2A (Tier 2)

Pulled directly from the transcript. Complements the existing Agentic AI deck (which
covers general orchestration patterns/frameworks) with the specific mechanics — how
tool calling actually works end-to-end, and a fully worked ReAct example.

## Why RAG isn't enough — the bridge into tool calling

1. Even with a very long context window, "needle in a haystack" testing (placing a fact at different positions/depths in a long prompt) shows models reliably struggle to retrieve facts placed in roughly the first half of a long prompt — long context alone doesn't solve the retrieval problem.
2. Separately, every token in the prompt is a real, per-token cost — there's a direct financial incentive not to stuff everything into context even where it would technically fit.
3. RAG's three steps, named directly: **R**etrieve relevant documents, **A**ugment the prompt with them, **G**enerate the response from the augmented prompt.
4. Knowledge base construction has three tunable hyperparameters: embedding size (bigger captures more nuance, costs more storage/compute — typical order of magnitude: thousands of dimensions), chunk size (typically hundreds of tokens — too small loses context, too large dilutes the embedding), and chunk overlap (typically low hundreds of tokens, so content split awkwardly at a boundary is still fully present in an adjacent chunk).
5. Retrieval runs in two stages, explicitly borrowed from recommendation-system and search practice: candidate retrieval (cheap, optimized for recall — cast a wide net) followed by ranking/reranking (more compute-intensive, optimized for precision on the smaller candidate set).

## Tool calling / function calling — the mechanics

6. Definition used in the lecture (sourced from IBM): tool calling "allows autonomous systems to complete complex tasks by dynamically accessing and acting upon external resources." Two key elements: completing a task, and (optionally) relying on external resources to fill knowledge gaps a pretrained LLM has.
7. Tool/function APIs are pre-defined by the developer beforehand — they are not generated on the fly by the LLM. Python is the common convention for how these are expressed, though nothing about tool calling requires Python specifically.
8. What the LLM actually sees: only the function signature, its documented inputs/outputs, and a natural-language description — never the implementation. The model's job is narrowly to decide *which* function to call and *what arguments* to supply, not to reason about how the function works internally.
9. End-to-end flow: (1) the function API + documentation is inserted into the prompt preamble, (2) the LLM reads the user query and emits the function call with appropriate arguments, (3) the actual function executes completely outside the LLM (ordinary code, no model involved), (4) the structured result is fed back into the model's context, (5) the LLM generates the final natural-language response grounded in that result.

## ReAct — the worked example

10. ReAct = **Rea**son + **Act**. Complex goals get decomposed into a loop of atomic sub-steps rather than solved in one shot. The lecture uses the stage names observe → plan → act, but notes the original ReAct paper uses think → observe → act — the labels vary by source, the underlying loop structure is what matters.
11. Worked example (a cold room): **Observe** — user says their teddy bear is cold; the model links this to "room temperature," currently unknown. **Plan** — determine the room's actual temperature. **Act** — call a `get_current_room_temperature` tool. **Observe** (loop) — tool returns 65°F, interpreted as colder than expected. **Plan** — decide to raise the temperature. **Act** — call a `set_temperature` tool with the needed adjustment. **Observe** (loop) — temperature is now correct; exit the loop and respond to the user.
12. The defining feature of an agentic workflow, per this framing: at each loop iteration the model checks whether the goal has been reached — if yes, exit to a final response; if no, continue reasoning/acting. It's the presence of this repeated goal-check loop that distinguishes "agentic" from a single tool call.

## Multi-agent and A2A

13. Once you have more than one agent (e.g. one for thermostat control, one for energy distribution), you need standardized agent-to-agent communication — this is explicitly what motivated Google's release of the Agent-to-Agent (A2A) protocol.
14. Under A2A, each agent exposes a defined set of "skills" with examples, so other agents know what it can do — a developer defines both the skills themselves and the execution contract (what status gets emitted during a request, and how a cancel request is handled).
15. In the lecture's framing, each agent typically runs its own independent reasoning loop — agents interact only via their input/output interface, not by sharing internal state.
16. A practical operational risk raised directly in Q&A: token/cost budgets can spiral unpredictably across multiple communicating agents, since each agent's own loop consumes its own budget independently — this compounds rather than being capped by one shared budget.

## Safety

17. New capability (executing real actions, not just generating text) means new risk surface. Named example: **data exfiltration** — if an agent has both access to sensitive data and a tool capable of publicly-visible output (e.g. an email-sending tool), a crafted prompt could induce it to leak that data through the tool it has access to.
18. The instructors frame this as a direct consequence of moving from "the model outputs text" to "the model can take actions on your behalf" — the safety surface expands exactly as far as the tool access does.
