# Watch Guide

Every processed video, with a one-paragraph takeaway and an actual watch verdict —
checked against the transcript for real visual/code-walkthrough dependency (screen-share
cues, live demos, diagram references), not guessed. Method: scan each transcript for cues
like "as you can see," "let me show," "live demo," "notebook," then read the actual
context around any hits to tell a real screen-share apart from someone just talking about
a notebook. Updated as new videos get processed — this is now a standing step, not a
one-off.

---

## 🟢 Read notes only — no visual dependency found

Nothing on-screen matters here; reading is equivalent to watching.

**[CME 295 L1 — Transformer foundations](lecture-notes-cme295-l1.md)**
Tokenization tradeoffs, why word2vec's training is a "proxy task," the actual Q/K/V
mechanics, encoder/decoder attention types. Zero visual cues in the transcript — pure
lecture, no board work or diagrams referenced verbally.

**[CME 295 L6 — Reasoning Models & GRPO](lecture-notes-cme295-l6.md)**
GRPO's group-relative advantage (no value function), verifiable rewards behind DeepSeek
R1, pass@k derived from scratch. Near-zero visual dependency (3 hits, just references to
a training-curve graph you don't need to see to understand the point being made).

**[CME 295 L7 — Tool Calling & ReAct](lecture-notes-cme295-l7.md)**
The full worked ReAct loop (cold room → thermostat), tool-calling mechanics, the A2A
protocol's origin. Zero visual cues.

**[CME 295 L8 — Evals: Measurement Theory & Bias Taxonomy](lecture-notes-cme295-l8.md)**
Cohen's kappa, the three named LLM-judge biases, a worked factuality-scoring method.
Near-zero visual dependency (2 hits, generic slide references).

**[Inspect eval framework](notes-inspect-eval-framework.md)**
JJ Allaire on the framework used internally by Anthropic/DeepMind/Grok — Dataset/
Solver/Scorer architecture, why it's research-grade not production-grade. Zero visual cues.

**[GitHub Copilot evals](notes-github-copilot-evals.md)**
The "verifiable evaluations" taxonomy, Harness Lib's real pipeline, the training-
contamination lesson. Has 10 "notebook" mentions — checked the context: these are the
speakers *talking about* their old notebook-based workflow conversationally, not a live
demo on screen. Safe to read only.

**[LLM Evals: Common Mistakes](notes-llm-evals-common-mistakes.md)**
Hamel Husain: "prompts are the moat" — why letting developers (not domain experts) write
prompts and label data is the root failure. Zero visual dependency, pure interview.

**[Jerry Liu — Building Production-Ready RAG Applications](notes-jerry-liu-rag.md)**
The table-stakes → advanced → agents/fine-tuning difficulty ladder, the SEC 10-Q
metadata-filtering example, why reranking can sometimes hurt. Near-zero visual cues.

---

## 🟡 Has a real demo segment worth watching, rest is fine to read

**[Evals — Process & Methodology](evals-process.json) (Hamel & Shreya, BsWxPI9UM4c)**
Confirmed real screen content: they show actual production logs, a real garbled customer
text-message example, and a short clip of Andrew Ng. **Worth watching specifically for
the garbled-message example** — [▶ watch (20:54)](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=1254s)
— seeing the actual broken conversation is more vivid than reading about it — but the
conceptual content (open/axial coding, benevolent dictator, binary judges) is fully
captured in the cards already.

---

## 🔴 Genuinely code-along / hands-on — reading notes ≠ getting the full value

These are workshops where the point is *doing*, not just knowing. If you're building a
portfolio project, treat these as exercises, not videos.

**[RAG From Scratch — Lance Martin](notes-rag-from-scratch-langchain.md)**
Highest visual/code density of anything processed (31 cue hits: live demos, explicit
"code walkthrough," 17 notebook references). The notes cover routing, proposition
indexing, and RAPTOR conceptually — but this is a real code-along course. **Recommended
if you want a concrete RAG project to point to in interviews**, lower priority if you
just want the concepts (which the notes + `rag-from-scratch-cards.json` already cover).

**[Agentic Evals — Arize Workshop (Laurie Voss)](notes-agentic-evals-arize.md)**
A genuine hands-on workshop — Claude agent SDK, live tracing, writing real evals against
a pre-built agent. The standout *concept* (capability evals graduating into regression
evals) is fully captured in notes/cards. The actual skill of reading traces and writing
evals hands-on is not something notes can substitute for. **Recommended if you want
hands-on evals experience specifically** — this is ~2+ hours, budget accordingly.

---

*How I'll keep using this*: every new video gets the same transcript cue-scan before I
write a verdict — I'm not going to eyeball a title and guess. Verdicts land in one of
three buckets: read-only, has-a-worth-watching-segment (with a timestamp), or genuinely
hands-on (flagged for doing, not just watching).
