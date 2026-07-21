# CME 295 — Transformers & LLMs, Lecture 8: LLM Evaluation

**Instructors:** Afshine Amidi & Shervine Amidi (Stanford, Fall 2025)
**Source:** https://www.youtube.com/watch?v=8fNP4N46RRo
**Maps to:** LLM Evaluation (Tier 1, ~88% of postings)

Pulled directly from the lecture transcript. This is the more rigorous/statistical
companion to the Hamel Husain & Shreya Shankar practitioner talk already in the corpus —
that one covers the error-analysis *workflow*; this lecture covers the *measurement
theory* underneath it (inter-rater agreement math, metric taxonomy, bias catalog).

## Framing

1. "Evaluation" is ambiguous — it can mean output quality, latency, cost, or uptime. This lecture scopes specifically to output quality: how good is the actual response.
2. Evaluating LLM output is inherently hard because the model is a text-to-text system that can output natural language, code, or math reasoning — there's no single universal metric that covers all of it.

## The human-rating baseline, and why it's hard

3. The "ideal" evaluation is a human rating every output — but even human judgment can be subjective. Example given: is "a teddy bear is almost always a sweet gift, pick one that feels right" a *useful* response? Reasonable raters disagree.
4. This subjectivity is measured via inter-rater agreement metrics — the goal is making sure raters are aligned enough that ratings are meaningful.
5. Raw agreement rate (% of time two raters agree) is a flawed metric on its own: two raters responding completely randomly with probability 0.5 each will still "agree" 50% of the time by pure chance. A raw agreement number is meaningless without knowing this baseline.
6. Cohen's kappa corrects for this — it's a function of (observed agreement − chance agreement), so kappa = 1 means perfect agreement beyond chance, kappa = 0 means no better than random, and it can go negative if raters agree *less* than chance would predict.
7. Extensions exist for more raters or different data types: Fleiss' kappa, Krippendorff's alpha — same underlying idea (measure agreement relative to a random baseline), different formulas for different rating setups.
8. Practical use: teams track inter-rater agreement as a health metric, and run "agreement sessions" between raters when it's unsatisfactory, to realign on rating guidelines.
9. Human rating's second limitation, separate from subjectivity: it's slow and expensive at scale — rating a thousand outputs takes real time and money.

## Rule-based metrics (the pre-LLM-judge approach)

10. Rule-based metrics compare LLM output against a fixed human-written reference, removing the need to re-rate every iteration — you write references once, then measure against them repeatedly.
11. METEOR (translation-focused): a precision/recall F-score between predicted and reference text, combined with an ordering penalty (fewer, longer contiguous matched spans = better ordering = lower penalty). Its own hyperparameters (alpha, beta, gamma) are arbitrary/tuned, not principled.
12. BLEU: a precision-focused metric using matched n-grams, with a brevity penalty specifically to stop short translations from gaming a precision-only metric.
13. ROUGE: same family of idea, typically used for summarization rather than translation.
14. Core limitation shared by all of them: they don't tolerate stylistic variation. Two sentences that say the same thing in different words ("a plush teddy bear can comfort a child" vs. "soft toys help kids feel safe at bedtime") score poorly against each other despite being equally good.
15. Second limitation: correlation with actual human ratings is weak despite all the tuned hyperparameters, and the approach still requires human-written references to even get started.

## LLM-as-judge

16. Motivation: LLMs are pretrained on huge human-generated data and tuned toward human preference, so they already encode a lot of what "good" looks like — use one LLM to grade another's output.
17. Judge inputs: the original prompt, the response being graded, and the grading criteria. Judge outputs: a score (ideally binary — pass/fail) *and* a rationale explaining the score — the explainability is the key advantage over rule-based metrics, which just produce an opaque number.
18. Trick: ask the judge to output the rationale *before* the score, not after — mirrors chain-of-thought reasoning models, and empirically improves judge quality by giving the model a chance to "think" before committing to a verdict.
19. LLM-as-judge output isn't guaranteed to be parseable on its own — the model is fundamentally probabilistic. Fix: use structured output / constrained decoding (schema-forced generation, e.g. `text_format` in OpenAI's API) to guarantee the response actually parses.
20. Two judge setups: pointwise (rate one response in isolation — good/bad) and pairwise (given two responses, which is better — A or B). Pairwise judgments can also be used to synthetically generate preference data for training reward models.

## Three named LLM-judge biases

21. **Position bias**: in a pairwise setup, the judge can favor whichever response was presented first, independent of actual quality. Mitigation: ask both orderings (A-vs-B and B-vs-A) and take the majority/consistent verdict.
22. **Verbosity bias**: judges tend to prefer longer, more detailed responses regardless of whether they're actually more correct. Mitigations: explicitly instruct the judge to ignore length in the grading criteria, add in-context examples demonstrating verbosity isn't the goal, or apply a length penalty.
23. **Self-enhancement bias**: a model tends to prefer outputs it generated itself, likely because self-generated text is by definition high-probability under its own distribution. Mitigation: don't use the same model for generation and judging — use a different, typically larger/stronger-reasoning model as judge.
24. These three are explicitly not exhaustive — general misalignment between judge and human ground truth is its own separate risk, distinct from these three named patterns.

## Best practices (stated directly by the instructors)

25. Use crisp, explicit grading guidelines — subjective criteria produce inconsistent judgments.
26. Prefer binary (pass/fail) scales over granular ones — easier for the judge model, and easier for humans to calibrate against too, since humans also find binary choices easier to rate consistently than multi-point scales.
27. Always have the judge output rationale before score (see point 18).
28. Even though LLM-as-judge doesn't require human ratings to *start*, still periodically calibrate judge scores against human ratings via correlation analysis — don't over-optimize against a proxy metric that's meant to approximate, but can silently diverge from, actual human judgment.
29. Use low temperature (commonly 0.1–0.2) for evaluation runs specifically, to keep results reproducible across repeated runs — evaluation is a case where you want determinism, not creativity.

## Two broad output dimensions, and a worked factuality method

30. Output quality splits broadly into task performance (useful, factual, relevant) and format alignment (tone, style, safety).
31. Factuality specifically resists a simple binary score because a single response can be partially wrong. The instructors' worked method: (1) decompose the output into a list of discrete atomic facts via an LLM call, (2) fact-check each individually in binary fashion — often using RAG or web search against a knowledge base, (3) optionally weight facts by importance, (4) aggregate into a weighted score rather than a single pass/fail over the whole response.
