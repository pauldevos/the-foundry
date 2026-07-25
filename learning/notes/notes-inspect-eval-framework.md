# Inspect — the LLM Eval Framework Used by Anthropic, DeepMind, Grok

**Speaker:** JJ Allaire (founder of RStudio/Posit; built Inspect at the UK AI Security Institute)
**Source:** https://www.youtube.com/watch?v=_UY49Q_qFhs
**Maps to:** LLM Evaluation (Tier 1) — fills a real gap: Inspect wasn't in any deck yet
(existing evals-frameworks deck covers RAGAS/TruLens/DeepEval/Promptfoo, not this one).

## Origin and adoption — worth knowing for credibility in an interview

1. Built by JJ Allaire (RStudio/Posit founder) while working at the UK AI Security Institute, which runs an unusually large volume of pre-deployment frontier-model evaluations — reportedly more than almost any other organization.
2. Open-sourced in May (2025), and now used internally by Anthropic, DeepMind, and Grok, plus safety-focused orgs like Epoch, METR, and Apollo — a genuinely credible, widely-adopted framework, not a niche tool.
3. Explicitly positioned for research/pre-deployment evaluation, not production monitoring — the speaker states directly that Inspect deliberately does not build out production-pipeline features, since its actual users (labs, safety orgs) only do evals, not production serving. Worth knowing this distinction cold: Inspect ≠ a production observability tool like LangSmith/Arize.

## Core architecture — three concepts

4. **Dataset** — the input side: structured data with some grading guidance/ground truth plus an input (which can be a full message sequence, not just a single prompt).
5. **Solver** — the "heart of the system": whatever process elicits the model's final output to be scored. Can be as simple as a prompt template, or as complex as chain-of-thought + self-critique, an agent scaffold, or full tool use. This is the flexible, composable middle layer.
6. **Scorer** — grades the solver's output against the dataset's ground truth: LLM-as-judge, JSON-schema matching, or plain text comparison, among other schemes.
7. A minimal example runs all three concepts end to end: solver = chain-of-thought prompt → generate → self-critique round → final answer; scorer = a model-based grader.

## Two ways to use it

8. "Snap-together" mode: compose pre-built dataset/solver/scorer pieces for standard benchmark-style evals — the framework ships implementations of roughly 70 established benchmarks.
9. "Facilities" mode: use Inspect's lower-level infrastructure (universal LLM interface across providers, tool/sandbox support, scoring/statistics utilities, parallel execution) and write custom Python eval logic on top — for cases the pre-built pieces don't cover.
10. Real example cited: GPQA Diamond, a hard multiple-choice benchmark that frontier labs report scores on — went from roughly 50% two years prior to 85-90%+ now (approaching saturation), assembled from off-the-shelf dataset + multiple-choice solver + scorer, run across multiple epochs.
11. Agentic evals are directly supported — one example given is a capture-the-flag (CTF) security challenge where the model gets bash/Python tool access inside a sandboxed Docker container, evaluated on whether it can actually complete the challenge.

## Practical mechanics worth knowing

12. Multi-epoch execution (running the same eval multiple times and reducing/aggregating results) is built in — needed to get statistically reliable scores rather than trusting a single noisy run, especially for anything involving model sampling randomness.
13. Parallel execution is a first-class feature — the framework is built to run many evals (the speaker cites ~50) concurrently, which matters at the scale institutions like the UK AI Security Institute actually operate at (thousands of evaluations).
14. A `@task` decorator is the registration mechanism that turns a dataset+solver+scorer combination into a runnable eval — the framework's way of making evals modular and discoverable.
15. Every default template (solver prompts, scorer criteria) is customizable — the speaker is explicit that a genuinely rigorous eval will virtually always require customizing beyond the defaults, not just running an out-of-the-box benchmark.

## Positioning takeaway

16. If asked "what eval tooling would you use for X" in an interview: Inspect is the right answer specifically for rigorous, research-grade, or pre-deployment safety-style evaluation — not the answer for production monitoring/observability, where MLflow/LangSmith/Arize (already in the MLOps deck) are the better fit. Knowing this distinction is itself a signal of real fluency, not just name-dropping tools.
