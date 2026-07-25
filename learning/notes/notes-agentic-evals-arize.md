# Ship Real Agents: Hands-On Evals for Agentic Applications

**Speaker:** Laurie Voss, Head of Developer Experience at Arize AI (co-founded npm Inc.)
**Source:** https://www.youtube.com/watch?v=Xfl50508LZM
**Maps to:** LLM Evaluation (Tier 1), Agentic AI (Tier 1) — a hands-on workshop, genuinely
distinct frameworks not covered elsewhere in this repo.

## Why agents specifically make evaluation harder than a single LLM call

1. A single LLM call has one input and one output to grade. An agent has a whole trace — multiple tool calls, intermediate decisions, and a final outcome — any step of which can be where things actually went wrong, not just the final answer.
2. Read your traces before writing any evals. The workshop explicitly calls out that most tutorials skip this — spend real time reading actual outputs and categorizing what's failing before deciding what to measure.

## Three kinds of evals, explicitly distinguished

3. Code evals — deterministic, cheap, easy to run (does the output match an expected format/string).
4. Built-in evals — pre-built eval templates from a platform (Arize's, in this case).
5. LLM evals — an LLM judges semantic content, non-deterministic but flexible; can be a built-in template or a fully custom eval written from scratch.

## Capability evals vs. regression evals — the most valuable concept in this talk

6. A **capability eval** is a hill to climb: something the agent is currently bad at, that you expect it to mostly fail. You iterate against it, improving the agent until it passes reliably.
7. Once a capability eval hits ~100%, it **graduates into a regression eval** — folded into the permanent test suite to guarantee the agent never silently loses that capability again, while you write a *new* capability eval for the next thing to improve.
8. This means an eval suite's composition is never static — it's constantly converting yesterday's frontier (capability evals) into today's guardrails (regression evals), while new capability evals keep getting added at the frontier.
9. Cost allocation follows this same split: **don't skimp on capability evals** — that's where the agent is actually getting better, so spend the most expensive/thorough evaluation there. **Regression evals can be aggressively trimmed** — e.g. if you have 100 regression evals, you likely don't need all of them; a representative 20% sample can be nearly as protective at a fraction of the cost.

## The over-prescriptive eval trap

10. A named failure mode: writing an eval that hard-codes an *expected sequence* of tool calls/decisions ("must call tool A, then tool B, then decide C"). Agents — especially after a model upgrade — often find shorter or smarter paths to the same correct outcome, and an overly prescriptive eval will fail a genuinely *better* trace simply because it didn't match the expected path.
11. Practical implication: eval design should generally check outcomes and key constraints, not rigidly enforce a specific process, unless the process itself is the actual requirement.

## Why LLM-judge explanations matter, with a concrete example

12. Code evals produce a score with no explanation — there's nothing to explain, it's just a pass/fail check. LLM evals can output a rationale alongside the score, and that rationale is what makes an eval result actionable rather than just informative.
13. Worked example: a user asked for *budget* Tokyo travel recommendations. The agent gave real recommendations but omitted cost information. A naive check ("did it recommend Tokyo travel?") would pass — but the LLM judge caught the subtler failure: it didn't address the *budget* constraint specifically, and explained exactly that. That explanation-level detail is what tells you precisely what to fix in the prompt.

## Meta-evaluation

14. Meta-evaluation = evaluating your evaluators. Two forms discussed: (1) using an LLM to judge whether another LLM judge's verdict was actually correct, and (2) using consistency across repeated runs of the same task as a proxy signal for reliability — if an agent produces the same solution 10 times independently, that consistency itself can function as a quality/confidence signal, distinct from evaluating any single output.
15. Extension raised in Q&A: closed-loop optimization — having an agent generate several prompt variations, test all of them against an eval simultaneously, and pick the best one without a human in the loop. The speaker frames this as a genuine frontier, not yet reliable in practice ("very much the frontier right now... difficult to get to work").

## Practical guidance for building an eval suite

16. Build evals **one at a time, iteratively** — introducing multiple new evals simultaneously means a single prompt change can shift several eval results at once, making it impossible to attribute cause and effect. Get one capability eval working and trusted before adding the next.
17. Start small: read traces first, then write exactly one code eval as your very first eval (checking something simple, like expected format), then build out from there.
18. Signal for "when you actually need evals": the point where vibe-checking becomes the bottleneck — specifically, the first time changing one thing breaks something else *without you noticing*. That's the moment the cost of building evals is justified.
19. Experiments (a smaller, curated failure/test set) are for rapid iteration — you don't need to re-run your entire regression corpus on every change. Run experiments to hill-climb quickly, then periodically validate against the full dataset once you believe you've reached a stopping point, to catch any accidental overfitting or regression the smaller experiment set didn't reveal.
20. On live production traces: only run regression evals continuously, not capability evals — a capability eval measures something that (by definition, once it's a capability eval) isn't expected to be changing, so running it repeatedly on live traffic wastes cost for no new signal.
21. Whether to bundle multiple criteria into one eval or split them into separate single-criterion evals is explicitly context-dependent — resolved by asking non-technical stakeholders what the *actual* definition of "correct" is, versus what's merely a contributor to correctness. A specific stakeholder-required signal deserves its own eval; a nice-to-have that merely helps get there doesn't need to be measured separately.

## The overall loop, stated directly

22. Instrument → trace → eval → human-annotate → analyze those annotations → improve the agent → repeat. Evals aren't a one-time gate, they're this continuous loop.
