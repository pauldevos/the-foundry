# LLM Evals: Common Mistakes

**Speaker:** Hamel Husain (interview format)
**Source:** https://www.youtube.com/watch?v=GL0XhAj5LPE
**Maps to:** LLM Evaluation (Tier 1) — companion to the evals-process deck, same
practitioner, different angle: what people get wrong, not the workflow itself.

This is an interview, not a lecture — narrative and example-driven throughout. Notes +
clip links to the highest-value moments rather than forced flashcards.

## Mistake 1 — conflating foundation-model benchmarks with your own domain evals

Foundation model benchmarks (the ones flooding Twitter/news) are built for OpenAI/Anthropic
— people training general models. If you're building an application on top of an LLM,
those benchmarks tell you almost nothing about whether *your* use case works.

> "Think of this like the SATs or the GMAT for the LLM. You're not going to hire someone
> because they had a great SAT score... you're going to give them tasks specific to the
> role you're hiring for." — [▶ watch (1:25)](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=85s)

The bespoke evals you actually need are unglamorous — "is the summary within length,"
"did it follow all three instructions even by turn eight of the conversation" — which is
exactly why nobody's tweeting about them, and why teams underinvest here.

## Mistake 2 — letting developers write prompts and do labeling instead of domain experts

This is the strongest single point in the talk:

> "Prompts are the moat. The labeled data you're labeling — if you outsource that,
> you're outsourcing your moat." — [▶ watch (4:52)](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=292s)

The mistake happens quietly: teams treat "AI is complicated, must be a developer's job" as
obvious, without realizing that prompt-writing and labeling are actually business judgment
and taste — being delegated to people who don't have the domain context to exercise it.
Fix suggested: build integrated prompting environments with an admin mode so the *domain
expert* edits the live prompt directly, one step removed from letting the end user edit it
themselves — the developer's job becomes making that accessible, not authoring the prompt.

## Mistake 3 — treating ambiguity as something you can push onto the LLM

> "You can't send any ambiguity to an LLM. That's rule number one." —
> [▶ watch (6:43)](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=403s)

If domain experts disagree with each other on what's correct behavior for a given trace,
that disagreement is usually a symptom of an ambiguous spec, not a hard problem the model
needs to figure out on its own. Practical diagnostic mentioned: give 3 domain experts the
same traces to label independently and see where they disagree — disagreement clusters
point directly at underspecified requirements.

## Mistake 4 — relying only on generic observability tools instead of building your own annotation tool

> "...building your own annotation tools... happy from that lightning lesson where we
> vibe coded the labeling app." — [▶ watch (7:01)](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=419s)

Off-the-shelf observability/tracing tools are good at *collecting* traces but often still
too generic/complex for a non-technical domain expert to comfortably label in. The
recommendation: build (or vibe-code) a purpose-built labeling interface scoped exactly to
what your domain experts need to judge — friction in the labeling tool directly translates
into worse or abandoned labeling.

## Why this complements, not duplicates, the existing evals-process deck

The evals-process deck (from Hamel & Shreya's other talk) covers the *workflow* — open
coding, axial coding, the benevolent dictator. This talk is about what breaks *before* that
workflow even starts: wrong people doing the labeling, unresolved ambiguity, and generic
tooling that doesn't fit the actual labeling task. Read both; they're sequential, not
redundant.
