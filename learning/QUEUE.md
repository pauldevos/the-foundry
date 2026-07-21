# Processing Queue

Working state for the learning-deck build-out. Two separate queues — don't conflate them.

## Format rule (as of this update)

**Videos (narrative/case-study/workshop content)** → notes with real verified clip-timestamp
links to the 4-8 highest-value moments, **no forced flashcards**. Exception: if a video's
content is itself crisply definitional (a named algorithm, a specific formula, a bias
taxonomy — like CME295's GRPO/ReAct/eval-bias-taxonomy lectures), a small card set is still
fine, since that content isn't actually narrative even though the source is a video.

**Docs/reference/papers (LangGraph docs, RAGAS docs, Claude/OpenAI docs, vendor comparisons,
etc.)** → this is now the primary source for flashcards going forward, not videos. Need to
go find these sources — separate task from the video queue below.

---

## Queue A — Not yet pulled (blocked by YouTube IP rate-limit)

Retry these first thing next session; if still blocked, wait longer before retrying again
(don't hammer it — got us blocked in the first place).

| Video ID | Category | URL |
|---|---|---|
| `aHCDrAbH_go` | LangGraph | https://www.youtube.com/watch?v=aHCDrAbH_go |
| `1OLrT3dEzhA` | Agentic Patterns | https://www.youtube.com/watch?v=1OLrT3dEzhA |
| `y32PywFi7Ek` | CI/CD for AI | https://www.youtube.com/watch?v=y32PywFi7Ek |
| `vj68el9hRvU` | CI/CD for AI | https://www.youtube.com/watch?v=vj68el9hRvU |
| `C842vFY5kRo` | System Design | https://www.youtube.com/watch?v=C842vFY5kRo |
| `rSKh6bVuVZI` | (unidentified — pull title once unblocked) | https://www.youtube.com/watch?v=rSKh6bVuVZI |
| `jWy39wavbjY` | (unidentified — pull title once unblocked) | https://www.youtube.com/watch?v=jWy39wavbjY |

Last confirmed still blocked: this session, two separate checks (different videos), both `IpBlocked`.

---

## Queue B — Transcripts saved, not yet turned into notes + cards

These are safe on disk in `transcripts/` already — no re-pull needed, no blocking risk.
Just need the same treatment CME295 L7/L8 got: read transcript → write study notes
(20-30 points) → write a card deck (aim 15-50 cards depending on depth of source).

**CME 295 — rest of the course** (L1, L6, L7, L8 done):
| Video ID | Lecture | Topic (from transcript intro) |
|---|---|---|
| `yT84Y5zCnaA` | L2 | continuation of Transformer architecture |
| `Q5baLehv5So` | L3 | "finally introduce large language models" |
| `VlA_jt_3Qc4` | L4 | pre-midterm content |
| `PmW_TMQ3l0I` | L5 | post-midterm content |
| ~~`k5Fh-UgTuCo`~~ | ~~L6~~ | ✅ done — GRPO, verifiable rewards, pass@k |
| `Q86qzJ1K1Ss` | L9 | final lecture, special format |

**Evals batch (12 videos)** — titles confirmed via oEmbed:
| Video ID | Title |
|---|---|
| `t6r4U0SlnPc` | How to Process Documents at Scale with LLMs |
| `jkon5HsAq30` | Product Discovery Meets AI Evals with Teresa Torres |
| `qH1dZ8JLLdU` | Intro To Error Analysis: Creating Custom Data Annotation Apps |
| ~~`LwLxlEwrtRA`~~ | ✅ done — The Evals That Made GitHub Copilot |
| `7kXY-2fYdHI` | Graph Databases: When to Use Them (And When to Run Away) |
| `DgPr3HVp0eg` | SolveIt: The Thinking Developer's Environment w/ Jeremy Howard & Johno Whitaker |
| `aqKUwPKBkB0` | Build Your Own Eval Tools With Notebooks! |
| ~~`_UY49Q_qFhs`~~ | ✅ done — Inspect eval framework (JJ Allaire) |
| ~~`GL0XhAj5LPE`~~ | ✅ done — notes+clips only (Hamel Husain interview, narrative format) |
| `SnbGD677_u0` | Instrumenting & Evaluating LLMs |
| `0pnEUAwoDP0` | How to Build, Evaluate, and Iterate on LLM Agents |
| ~~`Xfl50508LZM`~~ | ✅ done — Ship Real Agents: Hands-On Evals — Laurie Voss, Arize |

**RAG:**
| Video ID | Title |
|---|---|
| ~~`sVcwVQRHIc8`~~ | ✅ done — Learn RAG From Scratch (routing, proposition indexing, RAPTOR) |

**Others:**
| Video ID | Title |
|---|---|
| `ib-wTAvCZqg` | Architecting and Testing Controllable Agents — Lance Martin |
| `kkL_y5t1jo4` | The LangChain Team Answers the Most Searched Questions About Agents |
| `agSRMrhNTf4` | Why Enterprise AI Adoption Is Slower Than You Think — Aaron Levie (Box) + Harrison Chase |
| `uCKhOmth2ms` | The best AI agents are simpler than you think |

**Processing order (updated per Paul's direction)**: finish every locally-pulled
transcript — evals batch, RAG-from-scratch, agents/others — before touching CME295
L2-L5/L9 or anything new from YouTube (which is blocked anyway). CME295 remainder is
explicitly deprioritized, not cancelled.
1. Evals batch (9 remaining: t6r4U0SlnPc, jkon5HsAq30, qH1dZ8JLLdU, 7kXY-2fYdHI, DgPr3HVp0eg, aqKUwPKBkB0, GL0XhAj5LPE, SnbGD677_u0, 0pnEUAwoDP0)
2. Agent/others (4 videos, none started: ib-wTAvCZqg, kkL_y5t1jo4, agSRMrhNTf4, uCKhOmth2ms)
3. ~~RAG-from-scratch~~ ✅ done
4. Only then: remaining CME295 lectures (L2-L5, L9)
5. Only then: retry Queue A once unblocked

---

*Update this file as items move between queues or get completed — don't just re-derive
it from conversation memory next time.*
