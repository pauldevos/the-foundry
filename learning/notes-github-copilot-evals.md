# The Evals That Made GitHub Copilot

**Speakers:** John Bryman (code completions, then web chat) and Sean Simster (offline eval frameworks, then prototyped Copilot Chat) — both early GitHub Copilot team members
**Source:** https://www.youtube.com/watch?v=LwLxlEwrtRA
**Maps to:** LLM Evaluation (Tier 1) — a real production case study, not framework/theory.

## The four-part eval taxonomy they actually used

1. **Algorithmic** (easiest): deterministic checks — equality checks, JSON schema adherence, response length limits. Cheap, fast, but only covers what's objectively checkable.
2. **Verifiable evaluations** (GitHub's own middle category): not a simple equality check, but still objectively gradable by running something — does generated code compile, does it pass unit tests, does a generated SQL query return the right rows (regardless of which exact query it wrote). This is the category most unique to this talk. — [▶ watch (8:10)](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=490s)
3. **LLM-as-judge** (subjective end): anything requiring human-like judgment at scale — preference between two completions, whether a response hallucinates or stays grounded in provided context.
4. **A/B testing**: underlies everything — the final real-world validation once a change actually ships to users.

## Harness Lib — their verifiable code-completion eval system

5. Built from real open-source repositories (Python and JavaScript specifically, chosen because their test suites were easy to run automatically). — [▶ watch full explanation from here (9:18)](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=558s)
6. Data pipeline: pull open-source repos → keep only ones where the existing test suite fully passes → use code coverage tooling to associate specific functions with the tests that cover them → filter candidate functions to ones with real unit test coverage, a reasonable line-count limit, and a docstring.
7. Evaluation mechanic: take a candidate function, remove ("melon-ball scoop out") its implementation, have the model regenerate it, then re-run the original unit test against the regenerated code — a genuinely verifiable pass/fail, not a judgment call. — [▶ watch (11:40)](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=700s)
8. Early baseline result cited: roughly 40-50% pass rate for an early Copilot version — a concrete number showing how much room there was to improve, and a metric the team could track directly against engineering changes.

## Real lessons learned (the valuable part)

9. **Training-data contamination risk**: since GitHub had a close early relationship with OpenAI, they could get the training-data cutoff date and filter eval repos to only those created/updated after it — without this, you risk "evaluating" a model on code it already memorized. — [▶ watch (13:40)](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=820s)
10. **Eval-set representativeness problem**: repos not in the training data tend to be newer, and newer repos tend to skew smaller and structurally different from what's actually seen in production traffic — meaning even a contamination-safe eval set can be systematically unrepresentative of real usage in ways that are hard to fully correct for.
11. A live disagreement between the two speakers, both valid: one wanted the harness to be a fully headless, exhaustively-testable system (better for integration-test-style rigor); the other pointed out that early-stage evaluation of a genuinely new capability needs a more flexible, experimental harness before it can be locked down — you can't wrap a not-yet-understood new capability in a rigid eval framework from day one. — [▶ watch this exchange (15:33)](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=933s)

## A/B testing in production

12. Once a change shipped, it started on a small percentage of traffic (e.g. 10%) and was monitored before wider rollout — standard staged rollout, but paired with a small, deliberately minimal set of key metrics.
13. Three key metrics, kept deliberately few: **completion acceptance rate** (did the user accept the ghost-text suggestion), **characters retained** (accounting for the common "accept everything, then edit" usage pattern — raw acceptance alone would overstate quality for users who mindlessly accept and clean up after), and **latency** (a suggestion that arrives too late is bad regardless of quality). — [▶ watch (18:21)](https://www.youtube.com/watch?v=LwLxlEwrtRA&t=1101s)
14. Beyond the few key metrics, they tracked a much larger set (high tens to ~100) of guardrail metrics — not hard pass/fail gates, but drift-monitoring signals to catch anything moving unexpectedly on the side, while keeping the primary decision-making metrics deliberately small in number.

## Takeaway for interview framing

15. The "verifiable evaluations" middle category is the most useful concept to cite from this talk specifically — it names a real, common situation (not a simple equality check, but still objectively gradable via execution) that pure "rule-based vs. LLM-judge" framings tend to skip over.
16. The acceptance-rate-vs-characters-retained distinction is a strong concrete example of a broader eval principle: a naive engagement metric (accept rate) can be gamed or misleading without a second metric (retained content) that captures whether the acceptance actually reflected quality.
