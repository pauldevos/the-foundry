# LLM Evals — Cross-Video Topic Map

**Maps to:** LLM Evaluation (Tier 1). Companion to `evals-process.json`,
`llm-evaluation-frameworks.json`, and `notes-llm-evals-common-mistakes.md` — those go deep
on one video each; this one is a deduplicated synthesis across 13 videos, so the same point
made by five different speakers shows up once, with every place it was said.

**Sources (13 videos, transcripts pulled 2026-08-05):**

| # | Title | URL |
|---|---|---|
| 1 | How to Build Agents That Answer Data Questions (DAB benchmark) | https://www.youtube.com/watch?v=ubk57rW_KUo |
| 2 | Why AI Evals Are the Hottest New Skill — Husain & Shankar | https://www.youtube.com/watch?v=BsWxPI9UM4c |
| 3 | How To Build AI Evals | https://www.youtube.com/watch?v=mF4CaijvJos |
| 4 | From Noob to Automated Evals in a Week — Teresa Torres | https://www.youtube.com/watch?v=N-qAOv_PNPc |
| 5 | Build Your Own Eval Tools With Notebooks! | https://www.youtube.com/watch?v=aqKUwPKBkB0 |
| 6 | How to Automate AI Evals (Correctly) | https://www.youtube.com/watch?v=tqUDjc1HzO4 |
| 7 | LLM Evals: Common Mistakes — Hamel Husain interview | https://www.youtube.com/watch?v=GL0XhAj5LPE |
| 8 | AI Evaluations Clearly Explained in 50 Min — Hamel Husain | https://www.youtube.com/watch?v=uiza7wp1KrE |
| 9 | Build Evals That Actually Matter — Nick Ung & Akshay Sharma, Lyft | https://www.youtube.com/watch?v=3z2uT5aDx_Y |
| 10 | LLM Eval Tools Compared: LangSmith | https://www.youtube.com/watch?v=y0vm_fjkejo |
| 11 | LLM Eval Tools Compared: Braintrust | https://www.youtube.com/watch?v=97iykOemOn4 |
| 12 | Using Claude Code with Eval Tools | https://www.youtube.com/watch?v=AsDjsLvtkbQ |
| 13 | LLM Eval Tools Compared: Arize Phoenix | https://www.youtube.com/watch?v=wcYnzHJlUR0 |

Citations below use `[V#]` keyed to this table. Timestamps are pulled from the actual
transcript entries for each video, never estimated.

## A. Core methodology (the recurring skeleton — 5-8 videos independently converge on this)

- **Read raw traces manually, write informal specific notes on the first thing wrong
  ("open coding")** — V2 [17:19](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=1039s),
  [22:13](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=1333s) · V7
  [20:51](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=1251s) · V8
  [4:39](https://www.youtube.com/watch?v=uiza7wp1KrE&t=279s),
  [5:27](https://www.youtube.com/watch?v=uiza7wp1KrE&t=327s) · V3
  [2:41](https://www.youtube.com/watch?v=mF4CaijvJos&t=161s) · V9
  [26:49](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=1609s)
- **An LLM clusters those raw notes into named failure categories ("axial coding")** — V2
  [32:18](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=1938s) · V7
  [20:51](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=1251s) · V8
  [10:51](https://www.youtube.com/watch?v=uiza7wp1KrE&t=651s) · V10
  [41:41](https://www.youtube.com/watch?v=y0vm_fjkejo&t=2501s) · V12
  [8:32](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=512s),
  [10:29](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=629s)
- **Count/prioritize categorized failures (pivot table) — a small number of categories
  usually account for most errors (Pareto)** — V2
  [46:02](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=2762s) · V8
  [14:13](https://www.youtube.com/watch?v=uiza7wp1KrE&t=853s) · V6
  [4:48](https://www.youtube.com/watch?v=tqUDjc1HzO4&t=288s)
- **Full automation of discovery doesn't work — an LLM given raw traces and "find what's
  wrong" lacks business/taste context; needs a human anchor** — V2
  [24:04](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=1444s) · V6
  [1:23](https://www.youtube.com/watch?v=tqUDjc1HzO4&t=83s),
  [6:00](https://www.youtube.com/watch?v=tqUDjc1HzO4&t=360s) · V12
  [10:29](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=629s) (framed as "second opinion,"
  not replacement)
- **"Benevolent dictator" — one accountable domain expert owns the labeling call, not a
  committee** — V2 [25:41](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=1541s) · V3
  [9:56](https://www.youtube.com/watch?v=mF4CaijvJos&t=596s) (negative proof: two "expert"
  annotators disagreed worse than a coin flip)
- **Theoretical saturation as the stopping rule — keep labeling until no new categories
  appear; heuristics given range ~30 examples to ~100 traces** — V2
  [30:30](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=1830s) · V7
  [17:37](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=1057s) · V8
  [42:50](https://www.youtube.com/watch?v=uiza7wp1KrE&t=2570s)
- **You can't send ambiguity to the LLM — if domain experts disagree on the same trace,
  that's an underspecified spec, not a hard model problem** — V7
  [5:57](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=357s),
  [6:43](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=403s) · V3
  [9:56](https://www.youtube.com/watch?v=mF4CaijvJos&t=596s)
- **Domain-expert labeling/prompting is the moat — outsourcing it to disconnected
  developers gives away real differentiation** — V7
  [3:47](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=227s),
  [5:17](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=317s) · V4
  [19:42](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1182s) · V1
  [20:25](https://www.youtube.com/watch?v=ubk57rW_KUo&t=1225s)
- **Generic off-the-shelf metrics (helpfulness, toxicity, hallucination scores) don't tell
  you if *your* app works** — V7 [1:25](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=85s),
  [2:56](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=176s) · V8
  [44:04](https://www.youtube.com/watch?v=uiza7wp1KrE&t=2644s) · V9
  [18:34](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=1114s)
- **Eval rigor should scale with the stakes of the use case, not be uniform** — V6
  [22:53](https://www.youtube.com/watch?v=tqUDjc1HzO4&t=1373s)

## B. Judges: building and validating them

- **Prefer cheap deterministic code checks over an LLM judge wherever mechanically
  detectable** — V2 [48:05](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=2885s) · V4
  [18:44](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1124s) · V8
  [20:20](https://www.youtube.com/watch?v=uiza7wp1KrE&t=1220s)
- **One narrow binary (pass/fail) judge per specific failure mode — never one judge grading
  a whole trace, never a 1-5 Likert scale** — V2
  [52:28](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=3148s) · V7
  [12:23](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=743s),
  [15:13](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=913s),
  [16:53](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=1013s) · V8
  [24:11](https://www.youtube.com/watch?v=uiza7wp1KrE&t=1451s),
  [25:01](https://www.youtube.com/watch?v=uiza7wp1KrE&t=1501s),
  [47:14](https://www.youtube.com/watch?v=uiza7wp1KrE&t=2834s)
- **Judge criteria must come from real observed failures (error analysis), not
  brainstormed in the abstract** — V7
  [13:19](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=799s) · V2
  [1:01:03](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=3663s) ("judge prompts as living
  PRDs")
- **Never trust raw agreement % — misleading when real failures are rare** — V2
  [58:41](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=3521s) · V8
  [28:55](https://www.youtube.com/watch?v=uiza7wp1KrE&t=1735s)
- **Validate with a confusion matrix / TPR & TNR against human labels instead** — V2
  [59:34](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=3574s) · V3
  [1:39](https://www.youtube.com/watch?v=mF4CaijvJos&t=99s) · V8
  [30:30](https://www.youtube.com/watch?v=uiza7wp1KrE&t=1830s),
  [31:08](https://www.youtube.com/watch?v=uiza7wp1KrE&t=1868s) · V9
  [21:20](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=1280s) (precision/recall against
  ~100 hand-labeled examples)
- **False-positive vs. false-negative cost is a business call, not a universal threshold**
  — V8 [33:45](https://www.youtube.com/watch?v=uiza7wp1KrE&t=2025s)
- **Freeze the judge's model after calibration — swapping models invalidates the measured
  TPR/TNR** — V3 [30:44](https://www.youtube.com/watch?v=mF4CaijvJos&t=1844s)
- **Hold out a test split so few-shot examples in the judge prompt don't get memorized** —
  V8 [34:39](https://www.youtube.com/watch?v=uiza7wp1KrE&t=2079s) · V3
  [12:58](https://www.youtube.com/watch?v=mF4CaijvJos&t=778s)
- **Small labeled sets (25-30 traces) break standard train/val/test norms — treat offline
  sets like curated CI unit tests, not a random production sample; don't trust small-sample
  deltas without confidence intervals** — V7
  [24:07](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=1447s),
  [25:15](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=1515s) · V9
  [24:57](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=1495s)
- **Deploy validated judges as CI regression gates + daily production sampling for drift
  monitoring** — V3 [20:08](https://www.youtube.com/watch?v=mF4CaijvJos&t=1208s),
  [20:28](https://www.youtube.com/watch?v=mF4CaijvJos&t=1228s),
  [29:28](https://www.youtube.com/watch?v=mF4CaijvJos&t=1768s) · V8
  [35:56](https://www.youtube.com/watch?v=uiza7wp1KrE&t=2156s) · V9
  [2:15](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=135s),
  [4:38](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=278s)
- **Criteria drift — what counts as "good" evolves the more examples you review; keep
  refining against real data, don't fix the rubric upfront** — V2
  [1:04:19](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=3859s) · V9
  [23:32](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=1412s)
- **Not every failure mode deserves a formal eval — persistent, hard-to-diagnose recurring
  errors are the best candidates** — V2
  [46:02](https://www.youtube.com/watch?v=BsWxPI9UM4c&t=2762s) · V3
  [24:38](https://www.youtube.com/watch?v=mF4CaijvJos&t=1478s),
  [33:24](https://www.youtube.com/watch?v=mF4CaijvJos&t=2004s)

## C. Synthetic data & user/agent simulation

- **Naive "ask the LLM for more test queries" produces low-diversity, unrepresentative
  data** — V10 [23:12](https://www.youtube.com/watch?v=y0vm_fjkejo&t=1392s),
  [25:28](https://www.youtube.com/watch?v=y0vm_fjkejo&t=1528s) · V9
  [11:16](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=676s)
- **Fix: define persona/scenario dimensions first, generate from combinations of those
  dimensions** — V8 [16:22](https://www.youtube.com/watch?v=uiza7wp1KrE&t=982s) · V10
  [27:56](https://www.youtube.com/watch?v=y0vm_fjkejo&t=1676s) · V13
  [18:50](https://www.youtube.com/watch?v=wcYnzHJlUR0&t=1130s),
  [19:46](https://www.youtube.com/watch?v=wcYnzHJlUR0&t=1186s)
- **Small, carefully vetted eval sets beat large noisy synthetic ones** — V10
  [29:43](https://www.youtube.com/watch?v=y0vm_fjkejo&t=1783s)
- **Ground synthetic dimensions in real customer/user research, not the abstract** — V4
  [56:19](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=3379s) · V9
  [16:23](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=983s)
- **Multi-turn agent testing needs a user *simulator* — frontier-model simulators are
  unrealistically polite/patient, inflating pass rates; fine-tuning the simulator on real
  user verbatims makes the eval harder and more honest** — V9
  [7:45](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=465s),
  [13:52](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=832s),
  [15:23](https://www.youtube.com/watch?v=3z2uT5aDx_Y&t=923s)

## D. Agent-assisted / AI-automated eval workflows

- **Wire a coding agent directly to trace/eval telemetry so it can grep/search structured
  data, not read human dashboards** — V12
  [4:04](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=244s),
  [7:33](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=453s) · V3
  [13:53](https://www.youtube.com/watch?v=mF4CaijvJos&t=833s) (NL access via MCP)
- **Agent does open/axial coding as a "second opinion," not a replacement for human
  review** — V12 [10:29](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=629s) · V6
  [16:29](https://www.youtube.com/watch?v=tqUDjc1HzO4&t=989s)
- **Persist discovered failure-mode definitions as reusable memory/skills instead of
  rediscovering from scratch every run; review multiple passes, not just one** — V6
  [7:54](https://www.youtube.com/watch?v=tqUDjc1HzO4&t=474s),
  [19:27](https://www.youtube.com/watch?v=tqUDjc1HzO4&t=1167s),
  [20:59](https://www.youtube.com/watch?v=tqUDjc1HzO4&t=1259s) · V3
  [17:26](https://www.youtube.com/watch?v=mF4CaijvJos&t=1046s)
- **Any agent-proposed change should be reviewed like a PR, backed by before/after eval
  evidence — not taken on faith** — V12
  [14:23](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=863s),
  [22:37](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=1357s),
  [23:48](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=1428s)
- **General coding agents can rival dedicated eval-vendor tooling at finding failure
  modes, since those vendor tools are often just a prompt + thin harness** — V6
  [24:43](https://www.youtube.com/watch?v=tqUDjc1HzO4&t=1483s)
- **Downloaded agent skills carry real risk (prompt injection) and are unreliable — one
  cited benchmark found skills fire only ~52% of the time; review/diff them like code** —
  V12 [26:16](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=1576s),
  [29:42](https://www.youtube.com/watch?v=AsDjsLvtkbQ&t=1782s)
- **LLM-as-judge to scale failure-mode labeling once a taxonomy is defined manually** — V1
  [15:27](https://www.youtube.com/watch?v=ubk57rW_KUo&t=927s)

## E. Annotation & data-exploration tooling

- **Build bespoke annotation tools rather than relying on generic observability
  dashboards — labeling-tool friction directly costs labeling quality** — V7
  [6:59](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=419s),
  [8:16](https://www.youtube.com/watch?v=GL0XhAj5LPE&t=496s) · V4
  [39:56](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=2396s) · V5 (whole video — "Any
  Widget" cross-platform notebook widgets)
- **Reduce most labeling tasks to a binary yes/no/skip decision loop, with a free-text/
  voice note field to explain why** — V5
  [46:38](https://www.youtube.com/watch?v=aqKUwPKBkB0&t=2798s),
  [48:16](https://www.youtube.com/watch?v=aqKUwPKBkB0&t=2896s) · V13
  [22:23](https://www.youtube.com/watch?v=wcYnzHJlUR0&t=1343s)
- **"Look at your data, don't just stare at a chart" — an aggregate score is not proof of
  quality** — V5 [2:05](https://www.youtube.com/watch?v=aqKUwPKBkB0&t=125s),
  [4:21](https://www.youtube.com/watch?v=aqKUwPKBkB0&t=261s) · V11
  [12:22](https://www.youtube.com/watch?v=97iykOemOn4&t=742s)
- **Embed + UMAP-reduce text data to spot failure clusters qualitatively before formal
  labeling** — V5 [28:10](https://www.youtube.com/watch?v=aqKUwPKBkB0&t=1690s),
  [28:54](https://www.youtube.com/watch?v=aqKUwPKBkB0&t=1734s),
  [32:00](https://www.youtube.com/watch?v=aqKUwPKBkB0&t=1920s)
- **Lightweight tools built fast (Airtable, a notebook widget, a few-hours custom UI) beat
  adopting a full eval platform when starting out** — V4
  [10:27](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=627s),
  [14:59](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=899s) · V8
  [40:21](https://www.youtube.com/watch?v=uiza7wp1KrE&t=2421s)
- **Evals can catch bugs in your own code, or reveal your human labels/rubric were wrong —
  not just catch model errors** — V4
  [27:03](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1623s),
  [28:28](https://www.youtube.com/watch?v=N-qAOv_PNPc&t=1708s)
- **Domain-expert-friendly dimension-tuple labeling; a swipe/"Tinder-style" UI was floated
  to speed SME review** — V11 [17:30](https://www.youtube.com/watch?v=97iykOemOn4&t=1050s),
  [20:05](https://www.youtube.com/watch?v=97iykOemOn4&t=1205s)

## F. Tool-specific notes (LangSmith / Braintrust / Arize Phoenix)

- **Prompt playground tied to a dataset is table stakes across all three tools** — V10
  [6:44](https://www.youtube.com/watch?v=y0vm_fjkejo&t=404s) · V11
  [2:52](https://www.youtube.com/watch?v=97iykOemOn4&t=172s) · V13
  [3:39](https://www.youtube.com/watch?v=wcYnzHJlUR0&t=219s),
  [4:12](https://www.youtube.com/watch?v=wcYnzHJlUR0&t=252s)
- **Dataset creation via CSV/JSONL upload with column mapping** — V10
  [13:19](https://www.youtube.com/watch?v=y0vm_fjkejo&t=799s) · V11
  [2:06](https://www.youtube.com/watch?v=97iykOemOn4&t=126s)
- **One-click auto-instrumentation decorator/wrapper for logging traces** — V10
  [3:45](https://www.youtube.com/watch?v=y0vm_fjkejo&t=225s) (`traceable`) · V11
  [22:51](https://www.youtube.com/watch?v=97iykOemOn4&t=1371s) (`init_logger`)
- **"Auto-optimize this prompt" buttons exist (Braintrust) but reviewers are skeptical of
  optimizing against an unvalidated scoring function** — V11
  [8:24](https://www.youtube.com/watch?v=97iykOemOn4&t=504s),
  [8:56](https://www.youtube.com/watch?v=97iykOemOn4&t=536s)
- **Every vendor defines "dataset/row/input/output" differently — no shared schema
  convention** — V10 [14:07](https://www.youtube.com/watch?v=y0vm_fjkejo&t=847s)
- **Phoenix (OSS/notebook-first, self-hosted) vs. Arize AX (enterprise scale, SSO) as two
  tiers of the same product family** — V13
  [1:03](https://www.youtube.com/watch?v=wcYnzHJlUR0&t=63s)
- **Reviewers preferred notebooks/DuckDB over learning a proprietary query syntax
  (Braintrust's BTQL)** — V11 [34:16](https://www.youtube.com/watch?v=97iykOemOn4&t=2056s)
- **No markdown rendering of model outputs in the results UI** — V13
  [8:42](https://www.youtube.com/watch?v=wcYnzHJlUR0&t=522s) (flagged as a repeat gap vs.
  an earlier tool in the same review series)

## G. Bonus: building a benchmark from scratch (V1, DAB)

Distinct from application-level evals — this is benchmark *construction*: ground the task
set in real user interviews, identify genuinely underrepresented challenge categories, use
deterministic/reversible data corruption so correctness stays auto-gradable, and sandbox
eval runs (no internet) to prevent contamination from agents just looking up the answer —
V1 [1:53](https://www.youtube.com/watch?v=ubk57rW_KUo&t=113s)–[21:57](https://www.youtube.com/watch?v=ubk57rW_KUo&t=1317s).

## Net takeaway

13 videos converge on essentially one methodology (sections A+B), with three genuinely
separate skill layers on top — synthetic/simulated test data (C), agent-assisted tooling
(D), hands-on annotation UX (E) — plus a tool-comparison layer that's mostly vendor-feature
trivia (F). Sections A+B are the highest-yield material for interview prep; F is useful
vocabulary but lower priority to memorize.
