# CME 295 — Transformers & LLMs, Lecture 6: LLM Reasoning

**Instructors:** Afshine Amidi & Shervine Amidi (Stanford, Fall 2025)
**Source:** https://www.youtube.com/watch?v=k5Fh-UgTuCo
**Maps to:** LLM Architecture & Tradeoffs (Tier 1) — completes the L6→L7→L8 arc
(reasoning → tools/agents → evals) alongside notes already in the repo.

## Recap that sets up this lecture

1. Three-stage training pipeline recap: pre-training (compute-intensive, teaches raw structure of text/code — model can only autocomplete), SFT/fine-tuning (teaches the model to behave usefully, e.g. as an assistant, via a high-quality curated dataset), preference tuning (aligns the model with human preferences, e.g. RLHF — itself two steps: learn to distinguish good/bad from human preference data, then an RL stage).
2. The RL framing used throughout: the LLM is the "agent," the environment is the space of tokens it can predict over, the policy is the probability distribution over next tokens given what's been generated so far, and reward comes from a trained preference/reward model (in RLHF) — this framing carries directly into how GRPO is explained.

## GRPO — Group Relative Policy Optimization

3. GRPO (released 2024) became the standard RL algorithm for training reasoning models. Like PPO, it aims to maximize advantage (is this completion better than expected) while not deviating too far from the prior policy/reference model (via a KL-divergence term).
4. The key difference from PPO: PPO estimates advantage using a jointly-trained value function (predicting expected future reward via Generalized Advantage Estimation) — an expensive, complex bottleneck. GRPO eliminates the value function entirely.
5. GRPO's mechanism instead: sample multiple completions (a "group" of size G) for the same prompt, score each with a reward, then compute each completion's advantage as (its reward − group average reward) / (group standard deviation) — a purely relative measure against its own group, no separate model needed.
6. Intuition for why this works for reasoning specifically: a high reward on an easy problem isn't very informative, but a correct answer on a hard problem should be upweighted much more strongly — comparing within a group of attempts at the *same* prompt naturally captures this, without needing to model problem difficulty explicitly.
7. Implementation detail: the KL-divergence term (keeping the policy close to the reference model) gets folded into a per-token reward — only the final token carries the full completion-level reward, but every token carries its own KL term.

## Verifiable rewards

8. For math and code specifically, correctness can be checked deterministically — no reward model needed at all. Code: does the solution pass all test cases. Math: does the final answer match the ground truth.
9. Training reward is a combination of two signals: (1) a formatting reward — checking that reasoning/"think" tokens are actually present in the expected format, and (2) a correctness reward — checking the final answer is right.
10. This combination — RL against purely verifiable, rule-based rewards, no learned reward model at all — is presented as the mechanism behind DeepSeek R1's training, with a real performance curve shown on the AIME math benchmark climbing significantly as RL steps progress.

## pass@k — a reasoning/code eval metric, derived from scratch

11. pass@k measures: given n total sampled attempts at a problem (c of which are correct), what's the probability that at least one of a randomly selected k attempts is correct?
12. Estimating this by literally generating only k attempts and checking is noisy (high variance with small samples) — the standard approach instead samples a larger n, then computes the exact probability analytically.
13. Derivation trick used: P(at least one of k correct) = 1 − P(all k incorrect). The probability all k are incorrect is computed via sampling-without-replacement combinatorics: (n−c choose k) / (n choose k).
14. This metric matters directly for reasoning-model evaluation because reasoning models are often evaluated on "can it get this right within k attempts," not just single-shot accuracy.

## Controlling how much a model "thinks"

15. Not all prompts deserve equal reasoning effort — a simple factual question doesn't need the same thinking budget as a hard proof. Overthinking on easy prompts wastes tokens and latency.
16. One proposed mitigation: a lightweight classifier that looks at the prompt first and predicts whether it needs high or low reasoning effort, to set a dynamic thinking budget — explicitly described as still an open problem in the field, not a solved one.
17. A related hard constraint: the model's context window is finite, and reasoning chains consume it — a model that reasons for very long eventually runs into the same context-length ceiling as any other long-context use case.

## Connection to the "output length keeps growing" observation (from lecture 7's recap)

18. As GRPO-based RL training progresses, models reliably produce longer and longer reasoning chains — even after benchmark performance itself plateaus. The instructors trace this back to how the loss formulation weights tokens differently depending on whether they're part of a short or long response, which creates pressure toward longer outputs independent of whether length is actually helping.
